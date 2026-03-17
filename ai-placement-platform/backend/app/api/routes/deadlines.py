"""Deadline management endpoints — triggers WhatsApp & Calendar sync."""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.models import Deadline, Student
from app.schemas.schemas import DeadlineCreate, DeadlineResponse
from app.services.notification_service import NotificationService
from app.services.calendar_service import CalendarService
from app.services.n8n_service import N8nService

router = APIRouter()


@router.post("/{student_id}", response_model=DeadlineResponse, status_code=status.HTTP_201_CREATED)
async def add_deadline(
    student_id: str,
    payload: DeadlineCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Add a new application deadline.

    Automatically:
    1. Saves deadline to database
    2. Triggers WhatsApp notification (via n8n) in <30 seconds
    3. Creates Google Calendar event
    4. Sends email reminder
    """
    # Validate student exists
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Create deadline
    deadline = Deadline(
        student_id=student_id,
        title=f"[DEADLINE] {payload.company} — {payload.role} Application Due",
        company=payload.company,
        role=payload.role,
        deadline_at=payload.deadline_at,
        priority=payload.priority,
        application_url=payload.application_url,
        application_id=payload.application_id,
    )
    db.add(deadline)
    await db.flush()
    await db.refresh(deadline)

    # Fire automation pipeline in background (non-blocking)
    background_tasks.add_task(
        _trigger_deadline_automation,
        student=student,
        deadline=deadline,
    )

    return deadline


async def _trigger_deadline_automation(student: Student, deadline: Deadline):
    """
    Background task: fires all automation for a new deadline.

    Pipeline:
      n8n webhook → WhatsApp message (< 30s)
                 → Google Calendar event creation
                 → Email reminder
    """
    n8n = N8nService()
    calendar = CalendarService()

    # 1. Fire n8n webhook → WhatsApp + email automation
    await n8n.trigger_deadline_added(
        student_id=student.id,
        name=student.name,
        phone=student.phone,
        email=student.email,
        company=deadline.company,
        role=deadline.role,
        deadline_at=deadline.deadline_at,
        priority=deadline.priority.value,
        application_url=deadline.application_url or "",
        deadline_id=deadline.id,
    )

    # 2. Create Google Calendar event
    if student.google_calendar_token:
        event_id = await calendar.create_deadline_event(
            token=student.google_calendar_token,
            title=deadline.title,
            deadline_at=deadline.deadline_at,
            company=deadline.company,
            role=deadline.role,
            application_url=deadline.application_url,
        )
        # Update deadline with calendar event ID
        # (in production, re-query and update DB here)


@router.get("/{student_id}", response_model=List[DeadlineResponse])
async def get_student_deadlines(
    student_id: str,
    upcoming_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Get all deadlines for a student."""
    query = select(Deadline).where(Deadline.student_id == student_id)
    if upcoming_only:
        query = query.where(Deadline.deadline_at >= datetime.now(timezone.utc))
    query = query.order_by(Deadline.deadline_at.asc())

    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deadline(deadline_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a deadline."""
    result = await db.execute(select(Deadline).where(Deadline.id == deadline_id))
    deadline = result.scalar_one_or_none()
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    await db.delete(deadline)
