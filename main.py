from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

# models first
from app.models.user import User
from app.models.interview import InterviewSession, InterviewMessage

# routers after models
from app.routers.auth import router as auth_router
from app.routers.resume import router as resume_router
from app.routers.interview import router as interview_router  # ✅ was missing!

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(
    title="PrepMate AI",
    description="AI-powered mock interviewer",
    version="1.0.0",
    swagger_ui_init_oauth={},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(interview_router)

@app.get("/")
def root():
    return {
        "message": "PrepMate AI is running!",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}