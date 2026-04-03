from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title="MockMate",
    description="AI-powered mock interviewer",
    vrsion="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "MockMate is running!",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}