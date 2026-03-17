"""Resume parsing and scoring endpoints."""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import pdfplumber, io
from app.core.database import get_db
from app.models.models import Student
from app.services.ai_service import AIService

router = APIRouter()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...), student_id: str = None, db: AsyncSession = Depends(get_db)):
    if file.content_type not in ["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=422, detail="Only PDF and DOCX supported")
    content = await file.read()
    text = ""
    if file.content_type == "application/pdf":
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
    else:
        from docx import Document
        doc = Document(io.BytesIO(content))
        text = "\n".join(p.text for p in doc.paragraphs)
    if len(text.strip()) < 50:
        raise HTTPException(status_code=422, detail="Resume appears empty or unreadable")
    ai = AIService()
    parsed = await ai.parse_resume(text)
    cgpa = 7.0
    for edu in parsed.get("education", []):
        try: cgpa = float(edu.get("cgpa", 7.0)); break
        except: pass
    score = await ai.compute_placement_readiness_score(
        cgpa=cgpa, skills_count=len(parsed.get("skills",[])),
        applications_count=0, interviews_cleared=0,
        certifications_count=len(parsed.get("certifications",[])))
    if student_id:
        r = await db.execute(select(Student).where(Student.id == student_id))
        s = r.scalar_one_or_none()
        if s:
            if parsed.get("skills"): s.skills = parsed["skills"]
            s.placement_score = score
            await db.flush()
    return {**parsed, "score": score}

@router.post("/score")
async def score_resume(student_skills: list[str], job_skills: list[str]):
    return await AIService().compute_skill_gap(student_skills, job_skills)
