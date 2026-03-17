"""
AI Placement Platform — FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import (
    auth,
    students,
    applications,
    deadlines,
    notices,
    notifications,
    calendar_sync,
    resume,
    jobs,
    analytics,
    webhooks,
    ws,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Starting AI Placement Platform...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables ready")

    # Start background scheduler (nightly score recompute)
    from app.services.scheduler import start_scheduler, stop_scheduler
    start_scheduler()

    yield

    stop_scheduler()
    logger.info("🛑 Shutting down AI Placement Platform...")


app = FastAPI(
    title="AI Placement Platform API",
    description="""
    ## AI-Powered University Placement Management System

    ### Features
    - 🎓 Student Registration & Profile Management
    - 📄 AI Resume Parsing & Scoring
    - 💼 Intelligent Job Matching
    - ⏰ Deadline Tracker with Smart Notifications
    - 📱 WhatsApp & Email Automation
    - 📅 Google Calendar Integration
    - 📢 AI Notice Summarization & Broadcasting
    - 📊 Placement Analytics Dashboard
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ── Routes ───────────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(deadlines.router, prefix="/api/deadlines", tags=["Deadlines"])
app.include_router(notices.router, prefix="/api/notices", tags=["Notices"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(calendar_sync.router, prefix="/api/calendar", tags=["Calendar"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(webhooks.router, prefix="/webhook", tags=["Webhooks"])
app.include_router(ws.router, tags=["WebSocket"])


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Placement Platform API",
        "version": "1.0.0",
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "🎓 AI Placement Platform API",
        "docs": "/docs",
        "version": "1.0.0",
    }
