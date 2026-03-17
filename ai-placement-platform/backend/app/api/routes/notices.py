"""Notice board — AI summarization and broadcast endpoints."""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone
import time

from app.core.database import get_db
from app.models.models import Notice, Student
from app.schemas.schemas import NoticeCreate, NoticeSummaryResponse, BroadcastRequest, BroadcastResponse
from app.services.ai_service import AIService
from app.services.notification_service import NotificationService
from app.services.n8n_service import N8nService

router = APIRouter()


@router.post("/summarize", response_model=NoticeSummaryResponse, status_code=201)
async def summarize_notice(
    payload: NoticeCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Paste a raw college notice → AI generates 3-bullet summary.

    Uses OpenAI GPT to extract the 3 most important points from
    any length of raw notice text.
    """
    ai = AIService()

    # Generate AI summary
    summary = await ai.summarize_notice(payload.raw_content)

    # Extract title from first bullet or generate one
    title = await ai.extract_notice_title(payload.raw_content)

    # Save to database
    notice = Notice(
        title=title,
        raw_content=payload.raw_content,
        summary_bullets=summary.bullets,
        target_departments=payload.target_departments,
        target_years=payload.target_years,
    )
    db.add(notice)
    await db.flush()
    await db.refresh(notice)
    return notice


@router.post("/broadcast", response_model=BroadcastResponse)
async def broadcast_notice(
    payload: BroadcastRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Broadcast a summarized notice to all eligible students.

    Sends via:
    - WhatsApp (via n8n + WhatsApp Business API)
    - Email (via Gmail SMTP)
    - Dashboard push notification (WebSocket)
    """
    start_time = time.time()

    # Fetch notice
    result = await db.execute(select(Notice).where(Notice.id == payload.notice_id))
    notice = result.scalar_one_or_none()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")

    # Build recipient query
    query = select(Student).where(Student.is_active == True)
    if notice.target_departments:
        query = query.where(Student.department.in_(notice.target_departments))
    if notice.target_years:
        query = query.where(Student.year_of_study.in_(notice.target_years))

    students_result = await db.execute(query)
    students = students_result.scalars().all()
    recipients = len(students)

    if recipients == 0:
        raise HTTPException(status_code=400, detail="No eligible students found for this notice")

    # Fire broadcast via n8n
    n8n = N8nService()
    broadcast_result = await n8n.trigger_notice_broadcast(
        notice_id=notice.id,
        title=notice.title,
        bullets=notice.summary_bullets,
        student_phones=[s.phone for s in students],
        student_emails=[s.email for s in students],
        channels=payload.channels,
    )

    # Update notice record
    notice.is_broadcast = True
    notice.broadcast_at = datetime.now(timezone.utc)
    notice.recipients_count = recipients
    notice.broadcast_channels = payload.channels

    elapsed = round(time.time() - start_time, 2)

    return BroadcastResponse(
        notice_id=notice.id,
        recipients_targeted=recipients,
        whatsapp_delivered=broadcast_result.get("whatsapp_delivered", 0),
        emails_sent=broadcast_result.get("emails_sent", 0),
        dashboard_notifications=recipients,
        failed=recipients - broadcast_result.get("whatsapp_delivered", 0),
        time_taken_seconds=elapsed,
        broadcast_at=datetime.now(timezone.utc),
    )


@router.get("/", response_model=List[NoticeSummaryResponse])
async def list_notices(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List all notices."""
    result = await db.execute(
        select(Notice).order_by(Notice.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.get("/{notice_id}", response_model=NoticeSummaryResponse)
async def get_notice(notice_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific notice."""
    result = await db.execute(select(Notice).where(Notice.id == notice_id))
    notice = result.scalar_one_or_none()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return notice
