import requests

BASE = "http://localhost:8000"
TEST_EMAIL = "testuser@gmail.com"
TEST_PASSWORD = "test1234"
RESUME_FILE = "test_resume.pdf"

PASS = "✅"
FAIL = "❌"
SKIP = "⚠️ "

def check(label, condition, got=None):
    status = PASS if condition else FAIL
    print(f"  {status} {label}", f"→ {got}" if got and not condition else "")

def section(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

TOKEN = None
SESSION_ID = None
headers = {}

# ─────────────────────────────────────────────
# 1. AUTH TESTS
# ─────────────────────────────────────────────
section("1. AUTH — Register & Login")

# Register duplicate (should fail — user already exists)
r = requests.post(f"{BASE}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
if r.status_code == 400:
    check("Duplicate register blocked (400)", True)
elif r.status_code == 200:
    check("Registered new user (first time)", True)
else:
    check("Register endpoint reachable", False, r.text)

# Login with correct credentials
r = requests.post(f"{BASE}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
check("Login with correct credentials (200)", r.status_code == 200, r.text)
if r.status_code == 200:
    TOKEN = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {TOKEN}"}
    check("Token received in response", bool(TOKEN))
else:
    print(f"  {FAIL} Cannot continue without token. Exiting.")
    exit(1)

# Login with wrong password
r = requests.post(f"{BASE}/auth/login", json={"email": TEST_EMAIL, "password": "wrongpass"})
check("Login with wrong password blocked (401)", r.status_code == 401, r.text)

# Login with non-existent email
r = requests.post(f"{BASE}/auth/login", json={"email": "ghost@nowhere.com", "password": "abc"})
check("Login with unknown email blocked (401)", r.status_code == 401, r.text)

# ─────────────────────────────────────────────
# 2. PROTECTED ROUTE — No Token
# ─────────────────────────────────────────────
section("2. PROTECTED ROUTES — No Token (should all be 401)")

r = requests.post(f"{BASE}/resume/upload")
check("Resume upload without token → 401", r.status_code == 401, r.text)

r = requests.post(f"{BASE}/interview/start")
check("Interview start without token → 401", r.status_code == 401, r.text)

r = requests.get(f"{BASE}/interview/sessions")
check("Get sessions without token → 401", r.status_code == 401, r.text)

# ─────────────────────────────────────────────
# 3. RESUME UPLOAD
# ─────────────────────────────────────────────
section("3. RESUME UPLOAD")

try:
    with open(RESUME_FILE, "rb") as f:
        r = requests.post(f"{BASE}/resume/upload", headers=headers, files={"file": f})
    check("Resume upload (200)", r.status_code == 200, r.text)
    check("Response has resume_text field", "resume_text" in r.json() or "message" in r.json())
except FileNotFoundError:
    print(f"  {SKIP} '{RESUME_FILE}' not found — skipping upload test")
    print(f"       Place a test_resume.pdf in your project root to enable this test")

# Upload non-PDF (should fail)
r = requests.post(
    f"{BASE}/resume/upload",
    headers=headers,
    files={"file": ("fake.txt", b"this is not a pdf", "text/plain")}
)
check("Non-PDF upload blocked", r.status_code in [400, 422], r.text)

# ─────────────────────────────────────────────
# 4. INTERVIEW FLOW
# ─────────────────────────────────────────────
section("4. INTERVIEW — Start")

r = requests.post(f"{BASE}/interview/start", headers=headers)
check("Interview start (200)", r.status_code == 200, r.text)
if r.status_code == 200:
    data = r.json()
    SESSION_ID = data.get("session_id")
    check("session_id returned", bool(SESSION_ID))
    check("First question returned (message field)", bool(data.get("message")))
    print(f"\n  First question: {data.get('message', '')[:120]}...")
else:
    print(f"  {FAIL} Cannot continue interview tests. Check /interview/start")
    SESSION_ID = None

if SESSION_ID:
    section("5. INTERVIEW — Answer")

    answers = [
        "I have 3 years of experience in backend development with Python and FastAPI.",
        "I've worked on REST APIs, PostgreSQL databases, and JWT authentication.",
        "My biggest challenge was optimizing slow database queries using indexes.",
    ]

    for i, ans in enumerate(answers, 1):
        r = requests.post(f"{BASE}/interview/answer", headers=headers, json={
            "session_id": SESSION_ID,
            "answer": ans
        })
        check(f"Answer {i} submitted (200)", r.status_code == 200, r.text)
        if r.status_code == 200:
            msg = r.json().get("message", "")
            print(f"     AI follow-up: {msg[:100]}...")

    # Wrong session ID
    r = requests.post(f"{BASE}/interview/answer", headers=headers, json={
        "session_id": 99999,
        "answer": "This should fail"
    })
    check("Answer with invalid session_id blocked", r.status_code in [400, 404], r.text)

    # ─────────────────────────────────────────────
    # 6. HISTORY
    # ─────────────────────────────────────────────
    section("6. INTERVIEW — History")

    r = requests.get(f"{BASE}/interview/history", headers=headers, params={"session_id": SESSION_ID})
    check("History endpoint (200)", r.status_code == 200, r.text)
    if r.status_code == 200:
        msgs = r.json()
        check("History has messages", len(msgs) > 0)
        print(f"     {len(msgs)} messages in history so far")

    # History with invalid session
    r = requests.get(f"{BASE}/interview/history", headers=headers, params={"session_id": 99999})
    check("History with invalid session_id handled", r.status_code in [200, 400, 404], r.text)

    # ─────────────────────────────────────────────
    # 7. END INTERVIEW + SUMMARY
    # ─────────────────────────────────────────────
    section("7. INTERVIEW — End & Summary (AI call, may take ~15s)")

    print(f"  Calling /interview/end ... please wait")
    r = requests.post(f"{BASE}/interview/end", headers=headers, json={
        "session_id": SESSION_ID
    }, timeout=60)
    check("Interview end (200)", r.status_code == 200, r.text)
    if r.status_code == 200:
        data = r.json()
        check("Summary returned", bool(data.get("summary")))
        check("Score returned", data.get("score") is not None)
        score = data.get("score")
        if score is not None:
            check(f"Score is 1–10 (got {score})", 1 <= score <= 10)
        print(f"\n  Score: {score}/10")
        print(f"  Summary: {str(data.get('summary', ''))[:200]}...")

    # End same session again (should fail)
    r = requests.post(f"{BASE}/interview/end", headers=headers, json={
        "session_id": SESSION_ID
    }, timeout=60)
    check("Ending already-ended session handled", r.status_code in [400, 404, 200], r.text)

# ─────────────────────────────────────────────
# 8. SESSION HISTORY ENDPOINTS
# ─────────────────────────────────────────────
section("8. SESSION HISTORY")

r = requests.get(f"{BASE}/interview/sessions", headers=headers)
check("List all sessions (200)", r.status_code == 200, r.text)
if r.status_code == 200:
    sessions = r.json()
    check("Sessions list is not empty", len(sessions) > 0)
    print(f"     Total sessions: {len(sessions)}")

if SESSION_ID:
    r = requests.get(f"{BASE}/interview/sessions/{SESSION_ID}", headers=headers)
    check("Get session detail (200)", r.status_code == 200, r.text)
    if r.status_code == 200:
        s = r.json()
        check("Detail has session_id", bool(s.get("id") or s.get("session_id")))
        check("Detail has summary", bool(s.get("summary")))
        check("Detail has score", s.get("score") is not None)

    # Invalid session detail
    r = requests.get(f"{BASE}/interview/sessions/99999", headers=headers)
    check("Invalid session detail → 404", r.status_code == 404, r.text)

# ─────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────
section("ALL TESTS COMPLETE")
print()