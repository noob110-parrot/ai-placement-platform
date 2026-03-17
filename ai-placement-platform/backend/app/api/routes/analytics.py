"""Analytics + admin utility endpoints."""

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Student, Application

router = APIRouter()


@router.get("/stats")
async def placement_stats(db: AsyncSession = Depends(get_db)):
    total_q    = await db.execute(select(func.count(Student.id)).where(Student.is_active == True))
    placed_q   = await db.execute(select(func.count(Student.id)).where(Student.is_placed == True))
    avg_cgpa_q = await db.execute(select(func.avg(Student.cgpa)).where(Student.is_active == True))
    apps_q     = await db.execute(select(func.count(Application.id)))
    total    = total_q.scalar() or 0
    placed   = placed_q.scalar() or 0
    avg_cgpa = round(float(avg_cgpa_q.scalar() or 0), 2)
    apps     = apps_q.scalar() or 0
    dept_q = await db.execute(
        select(Student.department, func.count(Student.id).label("total"),
               func.sum(func.cast(Student.is_placed, int)).label("placed"))
        .where(Student.is_active == True).group_by(Student.department)
    )
    comp_q = await db.execute(
        select(Application.company, func.count(Application.id).label("count"))
        .group_by(Application.company).order_by(func.count(Application.id).desc()).limit(5)
    )
    return {
        "total_students":       total,
        "placed_students":      placed,
        "placement_percentage": round((placed / total * 100) if total else 0, 1),
        "avg_cgpa":             avg_cgpa,
        "total_applications":   apps,
        "top_recruiters":       [{"company": r.company, "count": r.count} for r in comp_q.all()],
        "department_breakdown": [{"dept": r.department, "total": r.total, "placed": r.placed or 0} for r in dept_q.all()],
    }


@router.get("/skill-demand")
async def skill_demand(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student.skills).where(Student.is_active == True))
    counts: dict = {}
    for row in result.all():
        for s in (row[0] or []):
            counts[s] = counts.get(s, 0) + 1
    return [{"skill": k, "count": v} for k, v in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:15]]


@router.post("/recompute-scores")
async def trigger_score_recompute(background_tasks: BackgroundTasks):
    """Manually trigger placement readiness score recompute for all students."""
    from app.services.scheduler import recompute_all_scores
    background_tasks.add_task(recompute_all_scores)
    return {"message": "Score recompute triggered in background"}


@router.get("/readiness-distribution")
async def readiness_distribution(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student.placement_score).where(Student.is_active == True))
    scores = [r[0] or 0 for r in result.all()]
    buckets = {"0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for s in scores:
        if s <= 40: buckets["0-40"] += 1
        elif s <= 60: buckets["41-60"] += 1
        elif s <= 80: buckets["61-80"] += 1
        else: buckets["81-100"] += 1
    return buckets
