import requests

BASE = "http://localhost:8000"

login = requests.post(f"{BASE}/auth/login", json={
    "email": "testuser@gmail.com",
    "password": "test1234"
})
print("LOGIN:", login.json())
TOKEN = login.json()["access_token"]
headers = {"Authorization": f"Bearer {TOKEN}"}
print("✅ Logged in")

with open("test_resume.pdf", "rb") as f:
    upload = requests.post(f"{BASE}/resume/upload", headers=headers, files={"file": f})
print("RESUME:", upload.json())

start = requests.post(f"{BASE}/interview/start", headers=headers)
print("START:", start.json())
SESSION_ID = start.json()["session_id"]

answer = requests.post(f"{BASE}/interview/answer", headers=headers, json={
    "session_id": SESSION_ID,
    "answer": "I have 3 years of experience in backend development."
})
print("ANSWER:", answer.json())

history = requests.get(f"{BASE}/interview/history", headers=headers, params={
    "session_id": SESSION_ID
})
print("HISTORY:", history.json())

end = requests.post(f"{BASE}/interview/end", headers=headers, json={
    "session_id": SESSION_ID
}, timeout=60)
print("END status:", end.status_code)
print("END raw:", end.text)
print("END:", end.json())

all_sessions = requests.get(f"{BASE}/interview/sessions", headers=headers)
print("ALL SESSIONS:", all_sessions.json())

detail = requests.get(f"{BASE}/interview/sessions/{SESSION_ID}", headers=headers)
print("SESSION DETAIL:", detail.json())