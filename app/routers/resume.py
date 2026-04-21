from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import pypdf
import io

from app.database import get_db
from app.models.user import User
from app.auth import get_current_user

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()

    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() or ""
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=422, detail="PDF appears to be empty or image-based (no extractable text).")

    current_user.resume_text = extracted_text
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Resume uploaded and parsed successfully.",
        "characters_extracted": len(extracted_text),
        "preview": extracted_text[:300]
    }