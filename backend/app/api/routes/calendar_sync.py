"""Google Calendar OAuth and sync endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Student
from app.services.calendar_service import CalendarService

router = APIRouter()

@router.get("/auth-url")
async def get_auth_url():
    cal = CalendarService()
    return {"url": await cal.get_oauth_url()}

@router.get("/callback")
async def oauth_callback(code: str, student_id: str, db: AsyncSession = Depends(get_db)):
    cal = CalendarService()
    token = await cal.exchange_code_for_token(code)
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.google_calendar_token = token
    await db.flush()
    return {"message": "Google Calendar connected", "student_id": student_id}

@router.get("/status/{student_id}")
async def calendar_status(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"connected": student.google_calendar_token is not None, "student_id": student_id}
