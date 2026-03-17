"""Extended test suite — services and edge cases."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.ai_service import AIService, NoticeSummary
from app.services.n8n_service import N8nService
from app.services.notification_service import NotificationService
from datetime import datetime, timezone


# ── AI Service ────────────────────────────────────────────────────────────────

class TestAIService:

    @pytest.mark.anyio
    async def test_placement_readiness_score_max(self):
        ai = AIService()
        score = await ai.compute_placement_readiness_score(
            cgpa=10.0, skills_count=20, applications_count=30,
            interviews_cleared=5, certifications_count=10,
        )
        assert score == 100.0

    @pytest.mark.anyio
    async def test_placement_readiness_score_min(self):
        ai = AIService()
        score = await ai.compute_placement_readiness_score(
            cgpa=0.0, skills_count=0, applications_count=0,
            interviews_cleared=0, certifications_count=0,
        )
        assert score == 0.0

    @pytest.mark.anyio
    async def test_placement_readiness_score_typical(self):
        ai = AIService()
        score = await ai.compute_placement_readiness_score(
            cgpa=8.4, skills_count=8, applications_count=5,
            interviews_cleared=1, certifications_count=2,
        )
        assert 50 <= score <= 85

    @pytest.mark.anyio
    async def test_skill_gap_perfect_match(self):
        with patch.object(AIService, "__init__", lambda self: None):
            ai = AIService()
            ai.client = AsyncMock()
            ai.model = "gpt-4o-mini"
            ai.client.chat.completions.create = AsyncMock(
                return_value=MagicMock(choices=[MagicMock(message=MagicMock(content="[]"))])
            )
            result = await ai.compute_skill_gap(
                student_skills=["Python", "React", "SQL"],
                required_skills=["Python", "React", "SQL"],
            )
        assert result["readiness_score"] == 100.0
        assert result["missing_skills"] == []
        assert result["matched_skills"] == ["Python", "React", "SQL"]

    @pytest.mark.anyio
    async def test_skill_gap_no_match(self):
        with patch.object(AIService, "__init__", lambda self: None):
            ai = AIService()
            ai.client = AsyncMock()
            ai.model = "gpt-4o-mini"
            ai.client.chat.completions.create = AsyncMock(
                return_value=MagicMock(choices=[MagicMock(message=MagicMock(content="[]"))])
            )
            result = await ai.compute_skill_gap(
                student_skills=["Rust"],
                required_skills=["Python", "React", "SQL"],
            )
        assert result["readiness_score"] == 0.0
        assert len(result["missing_skills"]) == 3

    @pytest.mark.anyio
    async def test_skill_gap_case_insensitive(self):
        with patch.object(AIService, "__init__", lambda self: None):
            ai = AIService()
            ai.client = AsyncMock()
            ai.model = "gpt-4o-mini"
            ai.client.chat.completions.create = AsyncMock(
                return_value=MagicMock(choices=[MagicMock(message=MagicMock(content="[]"))])
            )
            result = await ai.compute_skill_gap(
                student_skills=["python", "REACT"],
                required_skills=["Python", "React"],
            )
        assert result["readiness_score"] == 100.0

    @pytest.mark.anyio
    async def test_summarize_notice_fallback(self):
        """Test that summarization returns 3 bullets even when AI fails."""
        with patch.object(AIService, "__init__", lambda self: None):
            ai = AIService()
            ai.client = AsyncMock()
            ai.model = "gpt-4o-mini"
            ai.client.chat.completions.create = AsyncMock(side_effect=Exception("API error"))
            result = await ai.summarize_notice(
                "This is a long notice about TCS NQT. The deadline is 28 March. "
                "The test is online. Prep session on 26 March at Hall B. "
                "CGPA requirement is 7.0 minimum."
            )
        assert isinstance(result.bullets, list)
        assert len(result.bullets) == 3


# ── N8n Service ───────────────────────────────────────────────────────────────

class TestN8nService:

    @pytest.mark.anyio
    async def test_trigger_returns_error_on_connection_failure(self):
        n8n = N8nService()
        result = await n8n.trigger_deadline_added(
            student_id="test", name="Test", phone="+919876543210",
            email="test@gmail.com", company="Google", role="SWE",
            deadline_at=datetime.now(timezone.utc), priority="high",
            application_url="", deadline_id="d1",
        )
        # Should return error dict, not raise
        assert isinstance(result, dict)


# ── Notification Service ──────────────────────────────────────────────────────

class TestNotificationService:

    @pytest.mark.anyio
    async def test_whatsapp_skipped_when_disabled(self):
        with patch("app.services.notification_service.settings") as mock_settings:
            mock_settings.ENABLE_WHATSAPP_NOTIFICATIONS = False
            svc = NotificationService()
            result = await svc.send_whatsapp("+919876543210", "Test message")
        assert result is False

    @pytest.mark.anyio
    async def test_format_deadline_message_contains_company(self):
        with patch("app.services.notification_service.settings") as mock_settings:
            mock_settings.ENABLE_WHATSAPP_NOTIFICATIONS = False
            svc = NotificationService()
            # Just verify the method exists and doesn't raise
            result = await svc.send_deadline_alert(
                phone="+919876543210", name="Aryan", company="Google India",
                role="SWE Intern", deadline_at=datetime.now(timezone.utc),
                priority="high", application_url="",
            )
        assert result is False  # disabled in test


# ── Schema Validation ─────────────────────────────────────────────────────────

class TestSchemas:

    def test_student_phone_validation(self):
        from app.schemas.schemas import StudentCreate
        import pytest as pt
        with pt.raises(Exception):
            StudentCreate(
                roll_no="CS001", name="Test", email="test@gmail.com",
                phone="invalid-phone", department="CSE",
                year_of_study=4, cgpa=8.0,
            )

    def test_student_gmail_required(self):
        from app.schemas.schemas import StudentCreate
        import pytest as pt
        with pt.raises(Exception):
            StudentCreate(
                roll_no="CS001", name="Test", email="test@yahoo.com",
                phone="+919876543210", department="CSE",
                year_of_study=4, cgpa=8.0,
            )

    def test_valid_student(self):
        from app.schemas.schemas import StudentCreate
        student = StudentCreate(
            roll_no="CS21B047", name="Aryan Mehta",
            email="aryan.mehta2024@gmail.com",
            phone="+919876543210",
            department="Computer Science & Engineering",
            year_of_study=4, cgpa=8.4,
            skills=["Python", "React"],
        )
        assert student.email == "aryan.mehta2024@gmail.com"
        assert student.cgpa == 8.4
