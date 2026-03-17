"""
Shared pytest fixtures for the AI Placement Platform test suite.
"""

import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from unittest.mock import AsyncMock, patch

from app.main import app
from app.core.database import Base, get_db
from app.models.models import Student, Job


# ── Event loop ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ── In-memory test database ───────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def test_db(test_engine) -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)
    async with SessionLocal() as session:
        yield session
        await session.rollback()


# ── HTTP test client ──────────────────────────────────────────────────────────

@pytest.fixture
async def client(test_db) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client wired to the FastAPI app with test DB."""

    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ── Sample data fixtures ──────────────────────────────────────────────────────

@pytest.fixture
async def sample_student(test_db) -> Student:
    """A pre-inserted student for tests that need one to exist."""
    student = Student(
        roll_no="TEST001",
        name="Test Student",
        email="test.student@gmail.com",
        phone="+919876540001",
        department="Computer Science & Engineering",
        year_of_study=4,
        cgpa=8.0,
        skills=["Python", "React", "SQL"],
        placement_score=65.0,
    )
    test_db.add(student)
    await test_db.commit()
    await test_db.refresh(student)
    return student


@pytest.fixture
async def sample_job(test_db) -> Job:
    """A pre-inserted job for matching tests."""
    job = Job(
        title="Software Engineer Intern",
        company="Test Corp",
        description="Great internship opportunity",
        skills_required=["Python", "React"],
        min_cgpa=7.0,
        departments=["Computer Science & Engineering"],
        location="Bengaluru",
        job_type="internship",
        is_active=True,
    )
    test_db.add(job)
    await test_db.commit()
    await test_db.refresh(job)
    return job


# ── Mock services ─────────────────────────────────────────────────────────────

@pytest.fixture
def mock_notification_service():
    """Patch NotificationService so no real WhatsApp/emails are sent."""
    with patch("app.api.routes.students.NotificationService") as MockClass:
        instance = MockClass.return_value
        instance.send_welcome_whatsapp = AsyncMock(return_value=True)
        instance.send_deadline_alert   = AsyncMock(return_value=True)
        instance.send_notice_broadcast = AsyncMock(return_value=True)
        yield instance


@pytest.fixture
def mock_n8n_service():
    """Patch N8nService so no real webhook calls are made."""
    with patch("app.api.routes.deadlines.N8nService") as MockClass:
        instance = MockClass.return_value
        instance.trigger_deadline_added  = AsyncMock(return_value={"status": "ok"})
        instance.trigger_notice_broadcast = AsyncMock(return_value={"whatsapp_delivered": 10, "emails_sent": 10})
        instance.trigger_job_alert       = AsyncMock(return_value={"status": "ok"})
        yield instance


@pytest.fixture
def mock_calendar_service():
    """Patch CalendarService so no real Google Calendar calls are made."""
    with patch("app.services.calendar_service.CalendarService") as MockClass:
        instance = MockClass.return_value
        instance.create_deadline_event = AsyncMock(return_value="gcal_test_event_id")
        instance.get_oauth_url         = AsyncMock(return_value="https://accounts.google.com/o/oauth2/auth")
        instance.exchange_code_for_token = AsyncMock(return_value={
            "access_token": "test_access_token",
            "refresh_token": "test_refresh_token",
        })
        yield instance


@pytest.fixture
def mock_ai_service():
    """Patch AIService so no real OpenAI calls are made."""
    from app.services.ai_service import NoticeSummary
    with patch("app.api.routes.notices.AIService") as MockClass:
        instance = MockClass.return_value
        instance.summarize_notice = AsyncMock(return_value=NoticeSummary(
            bullets=[
                "TCS NQT deadline extended to 28 March 2026",
                "Online test 1–5 April 2026 — bring photo ID",
                "Prep session 26 March, 3 PM, Hall B — mandatory",
            ],
            title="TCS NQT Notice",
        ))
        instance.extract_notice_title = AsyncMock(return_value="TCS NQT Notice")
        yield instance
