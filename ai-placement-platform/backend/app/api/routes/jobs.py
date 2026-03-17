"""Job listings and semantic matching endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Job, Student
from app.services.job_matcher import JobMatcherService

router = APIRouter()


class JobCreate(BaseModel):
    title: str
    company: str
    description: str = ""
    skills_required: List[str] = []
    min_cgpa: float = 0.0
    location: str = ""
    job_type: str = "full-time"
    salary_range: str = ""
    application_url: str = ""
    departments: List[str] = []


@router.post("/", status_code=201)
async def create_job(payload: JobCreate, db: AsyncSession = Depends(get_db)):
    job = Job(**payload.model_dump())
    db.add(job)
    await db.flush()
    await db.refresh(job)
    return job


@router.get("/")
async def list_jobs(active_only: bool = True, skip: int = 0, limit: int = 20,
                    db: AsyncSession = Depends(get_db)):
    q = select(Job)
    if active_only:
        q = q.where(Job.is_active == True)
    r = await db.execute(q.offset(skip).limit(limit).order_by(Job.created_at.desc()))
    return r.scalars().all()


@router.get("/match/{student_id}")
async def match_jobs(student_id: str, db: AsyncSession = Depends(get_db)):
    """
    Semantic + keyword job matching for a student.
    Two-stage: keyword eligibility → sentence-transformer re-ranking.
    """
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    j_res = await db.execute(select(Job).where(Job.is_active == True))
    jobs = j_res.scalars().all()

    matcher = JobMatcherService()
    return matcher.rank_jobs(
        student_skills=student.skills or [],
        student_cgpa=student.cgpa,
        student_dept=student.department,
        jobs=jobs,
        top_n=10,
    )


@router.get("/{job_id}")
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Job).where(Job.id == job_id))
    j = r.scalar_one_or_none()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    return j
