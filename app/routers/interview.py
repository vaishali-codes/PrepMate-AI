from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.auth import get_current_user
from app.services.interview import get_ai_response, get_interview_summary

router = APIRouter(
    prefix="/interview",
    tags=["Interview"]
)
sessions = {}


class AnswerRequest(BaseModel):
    message: str


@router.post("/start")
def start_interview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.resume_text:
        raise HTTPException(
            status_code=400,
            detail="No resume found. Please upload your resume first."
        )

    sessions[current_user.id] = []

    ai_response = get_ai_response(current_user.resume_text, sessions[current_user.id])

    sessions[current_user.id].append({
        "role": "assistant",
        "content": ai_response
    })

    return {
        "message": "Interview started!",
        "ai": ai_response
    }


@router.post("/answer")
def answer_question(
    request: AnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id not in sessions:
        raise HTTPException(
            status_code=400,
            detail="No active interview session. Please start an interview first."
        )

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Answer cannot be empty.")

    sessions[current_user.id].append({
        "role": "user",
        "content": request.message
    })

    ai_response = get_ai_response(current_user.resume_text, sessions[current_user.id])

    sessions[current_user.id].append({
        "role": "assistant",
        "content": ai_response
    })

    return {
        "ai": ai_response,
        "questions_asked": len([m for m in sessions[current_user.id] if m["role"] == "assistant"])
    }


@router.get("/history")
def get_history(
    current_user: User = Depends(get_current_user)
):
    if current_user.id not in sessions:
        return {"history": []}

    return {"history": sessions[current_user.id]}


@router.post("/end")
def end_interview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id not in sessions:
        raise HTTPException(
            status_code=400,
            detail="No active interview session found."
        )

    history = sessions[current_user.id]

    if len(history) < 2:
        raise HTTPException(
            status_code=400,
            detail="Interview too short to summarize. Answer at least one question."
        )

    summary = get_interview_summary(current_user.resume_text, history)

    del sessions[current_user.id]

    return {
        "message": "Interview completed!",
        "questions_asked": len([m for m in history if m["role"] == "assistant"]),
        "summary": summary
    }