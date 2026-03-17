"""Test suite for AI Placement Platform API."""

import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


# ── Health ────────────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


# ── Student Registration ──────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_validate_gmail(client):
    response = await client.get("/api/students/validate-email?email=test@gmail.com")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["provider"] == "gmail"


@pytest.mark.anyio
async def test_validate_non_gmail(client):
    response = await client.get("/api/students/validate-email?email=test@yahoo.com")
    assert response.status_code == 200
    assert response.json()["valid"] is False


@pytest.mark.anyio
async def test_register_student_invalid_email(client):
    payload = {
        "roll_no": "CS21B001",
        "name": "Test Student",
        "email": "test@yahoo.com",
        "phone": "+919876543210",
        "department": "CSE",
        "year_of_study": 4,
        "cgpa": 8.0,
        "skills": ["Python"],
    }
    response = await client.post("/api/students/register", json=payload)
    assert response.status_code == 422  # Validation error


# ── AI Service ────────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_placement_readiness_score():
    from app.services.ai_service import AIService
    ai = AIService()
    score = await ai.compute_placement_readiness_score(
        cgpa=8.5, skills_count=8, applications_count=10,
        interviews_cleared=3, certifications_count=2,
    )
    assert 0 <= score <= 100


@pytest.mark.anyio
async def test_skill_gap_no_missing():
    from app.services.ai_service import AIService
    with patch.object(AIService, "__init__", lambda self: None):
        ai = AIService()
        ai.client = AsyncMock()
        ai.model = "gpt-4o-mini"
        # Mock the OpenAI call
        ai.client.chat.completions.create = AsyncMock(
            return_value=AsyncMock(choices=[AsyncMock(message=AsyncMock(content="[]"))])
        )
        result = await ai.compute_skill_gap(
            student_skills=["Python", "React"],
            required_skills=["Python", "React"],
        )
        assert result["readiness_score"] == 100.0
        assert result["missing_skills"] == []


# ── Notice Summarization ──────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_summarize_notice_endpoint(client):
    payload = {
        "raw_content": (
            "This is to inform all final-year CSE students that TCS has extended "
            "its registration deadline from 20th March to 28th March 2026. "
            "Students must have a minimum CGPA of 7.0. The test will be online. "
            "A preparatory session will be held on 26th March at 3 PM in Hall B."
        ),
        "target_departments": ["CSE"],
        "target_years": [4],
    }
    with patch("app.api.routes.notices.AIService") as MockAI:
        from app.services.ai_service import NoticeSummary
        instance = MockAI.return_value
        instance.summarize_notice = AsyncMock(
            return_value=NoticeSummary(
                bullets=[
                    "TCS registration extended to 28 March 2026 — register at tcsion.com",
                    "Minimum CGPA 7.0 required; online proctored test 1–5 April",
                    "Prep session 26 March, 3 PM, Hall B — mandatory attendance",
                ],
                title="TCS NQT Deadline Extension Notice",
            )
        )
        instance.extract_notice_title = AsyncMock(return_value="TCS NQT Deadline Extension Notice")
        response = await client.post("/api/notices/summarize", json=payload)
    assert response.status_code == 201
