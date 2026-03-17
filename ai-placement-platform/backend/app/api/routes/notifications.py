"""Notification management endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Notification

router = APIRouter()

@router.get("/{student_id}")
async def get_notifications(student_id: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).where(Notification.student_id == student_id)
        .order_by(Notification.created_at.desc()).limit(limit)
    )
    return result.scalars().all()

@router.get("/stats/summary")
async def notification_stats(db: AsyncSession = Depends(get_db)):
    total   = (await db.execute(select(func.count(Notification.id)))).scalar()
    sent    = (await db.execute(select(func.count(Notification.id)).where(Notification.status == "delivered"))).scalar()
    failed  = (await db.execute(select(func.count(Notification.id)).where(Notification.status == "failed"))).scalar()
    return {"total": total, "delivered": sent, "failed": failed, "success_rate": round((sent/total*100) if total else 0, 1)}

@router.post("/dashboard-push")
async def dashboard_push(student_email: str, title: str, body: str):
    """Endpoint for n8n to push dashboard notifications."""
    return {"status": "pushed", "student_email": student_email, "title": title}
