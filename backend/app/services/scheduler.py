"""
Placement Readiness Score Scheduler.

Runs as a background APScheduler job — recomputes placement_score
for all active, unplaced students every night at 2 AM.
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import Student, Application, ApplicationStatus
from app.services.ai_service import AIService

logger = logging.getLogger(__name__)
_scheduler: AsyncIOScheduler | None = None


async def recompute_all_scores() -> dict:
    """
    Recompute placement_score for every active, unplaced student.
    Called nightly by the scheduler and can also be triggered via API.
    """
    ai = AIService()
    updated = 0
    errors  = 0

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Student).where(
                Student.is_active == True,
                Student.is_placed == False,
            )
        )
        students = result.scalars().all()

        for student in students:
            try:
                # Count interviews cleared (status == "interview" or "offered")
                apps_result = await db.execute(
                    select(Application).where(Application.student_id == student.id)
                )
                apps = apps_result.scalars().all()
                total_apps       = len(apps)
                interviews_cleared = sum(
                    1 for a in apps
                    if a.status in (ApplicationStatus.INTERVIEW, ApplicationStatus.OFFERED)
                )

                new_score = await ai.compute_placement_readiness_score(
                    cgpa               = student.cgpa,
                    skills_count       = len(student.skills or []),
                    applications_count = total_apps,
                    interviews_cleared = interviews_cleared,
                    certifications_count = 0,
                )

                if abs(new_score - (student.placement_score or 0)) > 0.5:
                    student.placement_score = new_score
                    updated += 1

            except Exception as e:
                logger.error(f"Score recompute error for {student.id}: {e}")
                errors += 1

        await db.commit()

    logger.info(f"Score recompute complete — updated={updated}, errors={errors}")
    return {"updated": updated, "errors": errors, "total": len(students)}


def start_scheduler() -> AsyncIOScheduler:
    """Create, configure, and start the background scheduler."""
    global _scheduler
    if _scheduler and _scheduler.running:
        return _scheduler

    _scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

    # Recompute scores every night at 2:00 AM IST
    _scheduler.add_job(
        recompute_all_scores,
        trigger=CronTrigger(hour=2, minute=0),
        id="recompute_scores_nightly",
        name="Nightly Placement Score Recompute",
        replace_existing=True,
        misfire_grace_time=3600,
    )

    _scheduler.start()
    logger.info("Background scheduler started — nightly score recompute at 02:00 IST")
    return _scheduler


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("Background scheduler stopped")
