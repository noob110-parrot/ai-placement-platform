"""Application tracker routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.models import Application
from app.schemas.schemas import ApplicationCreate, ApplicationUpdate, ApplicationResponse

router = APIRouter()

@router.post("/{student_id}", response_model=ApplicationResponse, status_code=201)
async def create_application(student_id: str, payload: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    app = Application(student_id=student_id, company=payload.company, role=payload.role,
                      job_id=payload.job_id, notes=payload.notes)
    db.add(app)
    await db.flush()
    await db.refresh(app)
    return app

@router.get("/{student_id}", response_model=List[ApplicationResponse])
async def list_applications(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.student_id == student_id))
    return result.scalars().all()

@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(application_id: str, payload: ApplicationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).where(Application.id == application_id))
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(app, k, v)
    await db.flush()
    await db.refresh(app)
    return app
