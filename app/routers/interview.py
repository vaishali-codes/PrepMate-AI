from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.auth import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.interview import get_ai_response, get_interview_summary, extract_score

from app.models.interview import InterviewSession, InterviewMessage

router = APIRouter(prefix="/interview", tags=["interview"])


def build_conversation_history(session: InterviewSession) -> list:
    return [
        {"role": msg.role, "content": msg.content}
        for msg in session.messages
    ]


@router.post("/start")
def start_interview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.resume_text:
        raise HTTPException(status_code=400, detail="Please upload a resume before starting an interview.")

    new_session = InterviewSession(
        user_id=current_user.id,
        resume_text=current_user.resume_text,
        status="active"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    first_question = get_ai_response(
        resume_text=current_user.resume_text,
        conversation_history=[]
    )

    ai_message = InterviewMessage(
        session_id=new_session.id,
        role="assistant",
        content=first_question
    )
    db.add(ai_message)
    db.commit()

    return {
        "session_id": new_session.id,
        "message": first_question
    }


@router.post("/answer")
def submit_answer(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = payload.get("session_id")
    answer = payload.get("answer", "").strip()

    if not session_id or not answer:
        raise HTTPException(status_code=400, detail="session_id and answer are required.")

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if session.status == "ended":
        raise HTTPException(status_code=400, detail="This session has already ended.")

    user_message = InterviewMessage(
        session_id=session.id,
        role="user",
        content=answer
    )
    db.add(user_message)
    db.commit()
    db.refresh(session)

    history = build_conversation_history(session)
    next_question = get_ai_response(
        resume_text=session.resume_text,
        conversation_history=history
    )

    ai_message = InterviewMessage(
        session_id=session.id,
        role="assistant",
        content=next_question
    )
    db.add(ai_message)
    db.commit()

    return {
        "session_id": session.id,
        "message": next_question
    }


@router.get("/history")
def get_history(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return {
        "session_id": session.id,
        "status": session.status,
        "messages": build_conversation_history(session)
    }


@router.post("/end")
def end_interview(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required.")

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if session.status == "ended":
        raise HTTPException(status_code=400, detail="Session already ended.")

    message_count = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == session_id,
        InterviewMessage.role == "user"
    ).count()
    if message_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Please answer at least one question before ending the interview."
        )

    history = build_conversation_history(session)
    summary = get_interview_summary(
        resume_text=session.resume_text,
        conversation_history=history
    )
    score = extract_score(summary)
    session.status = "ended"
    session.summary = summary
    session.score = score
    session.ended_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "session_id": session.id,
        "score": score,
        "summary": summary
    }


@router.get("/sessions")
def get_all_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()

    return {
        "total": len(sessions),
        "sessions": [
            {
                "session_id": s.id,
                "status": s.status,
                "score": s.score,
                "created_at": s.created_at,
                "ended_at": s.ended_at,
                "has_summary": s.summary is not None
            }
            for s in sessions
        ]
    }


@router.get("/sessions/{session_id}")
def get_session_detail(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return {
        "session_id": session.id,
        "status": session.status,
        "score": session.score,
        "created_at": session.created_at,
        "ended_at": session.ended_at,
        "summary": session.summary,
        "messages": build_conversation_history(session)
    }