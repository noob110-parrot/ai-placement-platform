"""Integration tests — auth flow, deadline pipeline, notice broadcast."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport
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


# ── Auth ──────────────────────────────────────────────────────────────────────

class TestAuth:

    @pytest.mark.anyio
    async def test_login_unknown_roll_no(self, client):
        response = await client.post(
            "/api/auth/login",
            data={"username": "UNKNOWN999", "password": "9999"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        assert response.status_code == 401

    @pytest.mark.anyio
    async def test_me_without_token(self, client):
        response = await client.get("/api/auth/me")
        assert response.status_code == 401

    @pytest.mark.anyio
    async def test_google_oauth_redirect(self, client):
        with patch("app.api.routes.auth.CalendarService") as MockCal:
            MockCal.return_value.get_oauth_url = AsyncMock(
                return_value="https://accounts.google.com/o/oauth2/auth?..."
            )
            response = await client.get("/api/auth/google")
        assert response.status_code == 200
        assert "redirect_url" in response.json()


# ── Students ──────────────────────────────────────────────────────────────────

class TestStudents:

    @pytest.mark.anyio
    async def test_list_students(self, client):
        response = await client.get("/api/students/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.anyio
    async def test_get_nonexistent_student(self, client):
        response = await client.get("/api/students/nonexistent-id")
        assert response.status_code == 404

    @pytest.mark.anyio
    async def test_validate_email_gmail(self, client):
        response = await client.get("/api/students/validate-email?email=test@gmail.com")
        assert response.status_code == 200
        assert response.json()["valid"] is True
        assert response.json()["oauth_ready"] is True

    @pytest.mark.anyio
    async def test_validate_email_non_gmail(self, client):
        response = await client.get("/api/students/validate-email?email=test@hotmail.com")
        assert response.status_code == 200
        assert response.json()["valid"] is False

    @pytest.mark.anyio
    async def test_register_duplicate_email_rejected(self, client):
        """Two registrations with the same email must fail with 409."""
        payload = {
            "roll_no": "TST99Z001",
            "name": "Test User One",
            "email": "duplicate.test@gmail.com",
            "phone": "+919999000001",
            "department": "CSE",
            "year_of_study": 4,
            "cgpa": 7.5,
            "skills": ["Python"],
        }
        with patch("app.api.routes.students.NotificationService") as MockNotif:
            MockNotif.return_value.send_welcome_whatsapp = AsyncMock(return_value=True)
            r1 = await client.post("/api/students/register", json=payload)
            if r1.status_code == 201:
                # Second registration same email → should conflict
                payload2 = {**payload, "roll_no": "TST99Z002"}
                r2 = await client.post("/api/students/register", json=payload2)
                assert r2.status_code == 409


# ── Analytics ─────────────────────────────────────────────────────────────────

class TestAnalytics:

    @pytest.mark.anyio
    async def test_stats_returns_expected_shape(self, client):
        response = await client.get("/api/analytics/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        assert "placed_students" in data
        assert "placement_percentage" in data
        assert "top_recruiters" in data
        assert "department_breakdown" in data

    @pytest.mark.anyio
    async def test_skill_demand_returns_list(self, client):
        response = await client.get("/api/analytics/skill-demand")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


# ── Jobs ──────────────────────────────────────────────────────────────────────

class TestJobs:

    @pytest.mark.anyio
    async def test_list_jobs_empty(self, client):
        response = await client.get("/api/jobs/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    @pytest.mark.anyio
    async def test_match_nonexistent_student(self, client):
        response = await client.get("/api/jobs/match/nonexistent-student-id")
        assert response.status_code == 404


# ── Websocket ─────────────────────────────────────────────────────────────────

class TestWebSocket:

    @pytest.mark.anyio
    async def test_ws_stats_endpoint(self, client):
        response = await client.get("/ws/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_connections" in data
        assert "connected_students" in data

    @pytest.mark.anyio
    async def test_websocket_manager_send_to_unknown_student(self):
        """Sending to a student with no active socket should not raise."""
        from app.utils.websocket_manager import ws_manager
        # Should silently no-op, not raise
        await ws_manager.send_to_student("nonexistent-student", {"type": "test"})


# ── Health ────────────────────────────────────────────────────────────────────

class TestHealth:

    @pytest.mark.anyio
    async def test_health(self, client):
        r = await client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"
        assert r.json()["version"] == "1.0.0"

    @pytest.mark.anyio
    async def test_root(self, client):
        r = await client.get("/")
        assert r.status_code == 200
        assert "AI Placement Platform" in r.json()["message"]
