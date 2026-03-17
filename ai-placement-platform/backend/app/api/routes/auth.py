"""Authentication routes — JWT login, token refresh, Google OAuth."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_student
from app.core.config import settings
from app.models.models import Student

router = APIRouter()


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    student_id: str
    name: str
    email: str


@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Login with roll_no + last 4 digits of phone. Returns JWT."""
    result = await db.execute(select(Student).where(Student.roll_no == form_data.username))
    student = result.scalar_one_or_none()
    if not student or not form_data.password.endswith(student.phone[-4:]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(
        data={"sub": student.id, "roll_no": student.roll_no},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return LoginResponse(access_token=token, token_type="bearer",
                         student_id=student.id, name=student.name, email=student.email)


@router.get("/me")
async def get_me(current_student: Student = Depends(get_current_student)):
    return {"id": current_student.id, "roll_no": current_student.roll_no,
            "name": current_student.name, "email": current_student.email,
            "department": current_student.department, "cgpa": current_student.cgpa,
            "skills": current_student.skills, "placement_score": current_student.placement_score,
            "is_placed": current_student.is_placed}


@router.post("/refresh")
async def refresh_token(current_student: Student = Depends(get_current_student)):
    token = create_access_token(data={"sub": current_student.id, "roll_no": current_student.roll_no})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
async def logout():
    return {"message": "Logged out. Clear your access token on the client."}


@router.get("/google")
async def google_oauth_redirect():
    from app.services.calendar_service import CalendarService
    return {"redirect_url": await CalendarService().get_oauth_url()}


@router.get("/google/callback")
async def google_oauth_callback(code: str, student_id: str, db: AsyncSession = Depends(get_db)):
    from app.services.calendar_service import CalendarService
    token = await CalendarService().exchange_code_for_token(code)
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.google_calendar_token = token
    await db.flush()
    return {"message": "Google Calendar connected", "student_id": student_id, "calendar_sync": True}
