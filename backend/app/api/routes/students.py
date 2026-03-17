"""Student registration and management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.core.database import get_db
from app.models.models import Student
from app.schemas.schemas import StudentCreate, StudentResponse, StudentUpdate
from app.services.notification_service import NotificationService
from app.services.calendar_service import CalendarService

router = APIRouter()


@router.post("/register", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def register_student(
    payload: StudentCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new student.

    - Validates email (must be Gmail) and phone number
    - Stores profile in PostgreSQL
    - Sends welcome WhatsApp message
    - Enables Calendar & notification sync
    """
    # Check duplicate roll_no
    existing = await db.execute(
        select(Student).where(Student.roll_no == payload.roll_no)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Roll number {payload.roll_no} is already registered",
        )

    # Check duplicate email
    existing_email = await db.execute(
        select(Student).where(Student.email == payload.email)
    )
    if existing_email.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email {payload.email} is already registered",
        )

    # Create student record
    student = Student(
        roll_no=payload.roll_no,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        department=payload.department,
        year_of_study=payload.year_of_study,
        cgpa=payload.cgpa,
        skills=payload.skills,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student)

    # Fire welcome notification asynchronously (non-blocking)
    try:
        notif = NotificationService()
        await notif.send_welcome_whatsapp(student)
    except Exception:
        # Notification failure should NOT block registration
        pass

    return student


@router.get("/", response_model=List[StudentResponse])
async def list_students(
    department: str = None,
    year: int = None,
    placed: bool = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List all students with optional filters."""
    query = select(Student).where(Student.is_active == True)

    if department:
        query = query.where(Student.department.ilike(f"%{department}%"))
    if year:
        query = query.where(Student.year_of_study == year)
    if placed is not None:
        query = query.where(Student.is_placed == placed)

    query = query.offset(skip).limit(limit).order_by(Student.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, db: AsyncSession = Depends(get_db)):
    """Get student by ID."""
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: str,
    payload: StudentUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update student profile."""
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(student, field, value)

    await db.flush()
    await db.refresh(student)
    return student


@router.get("/validate-email")
async def validate_email(email: str):
    """Validate email format and check Gmail."""
    is_gmail = email.endswith("@gmail.com")
    return {
        "valid": is_gmail,
        "provider": "gmail" if is_gmail else "other",
        "oauth_ready": is_gmail,
        "message": "Gmail detected — Calendar & notification sync enabled" if is_gmail
                   else "Only Gmail addresses support Calendar & WhatsApp sync",
    }
