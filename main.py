from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.resume import router as resume_router

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(
    title="PrepMate AI",
    description="AI-powered mock interviewer",
    version="1.0.0",
    swagger_ui_init_oauth={},
)

app.include_router(auth_router)
app.include_router(resume_router)

@app.get("/")
def root():
    return {
        "message": "PrepMate AI is running!",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}