"""Tests for JobMatcherService and helper utilities."""

import pytest
from app.services.job_matcher import JobMatcherService
from app.utils.helpers import (
    normalize_phone, days_until, truncate_text,
    slugify, safe_float, format_indian_phone, deadline_urgency,
)
from datetime import datetime, timezone, timedelta


# ── JobMatcherService ─────────────────────────────────────────────────────────

class TestJobMatcherService:

    def setup_method(self):
        self.matcher = JobMatcherService()

    def test_keyword_score_perfect_match(self):
        score = self.matcher.keyword_score(
            student_skills=["Python", "React", "SQL"],
            required_skills=["Python", "React", "SQL"],
        )
        assert score == 100.0

    def test_keyword_score_no_match(self):
        score = self.matcher.keyword_score(
            student_skills=["Rust", "Go"],
            required_skills=["Python", "React"],
        )
        assert score == 0.0

    def test_keyword_score_partial(self):
        score = self.matcher.keyword_score(
            student_skills=["Python", "SQL"],
            required_skills=["Python", "React", "SQL", "Docker"],
        )
        assert score == 50.0

    def test_keyword_score_case_insensitive(self):
        score = self.matcher.keyword_score(
            student_skills=["python", "REACT"],
            required_skills=["Python", "React"],
        )
        assert score == 100.0

    def test_keyword_score_empty_requirements(self):
        score = self.matcher.keyword_score(
            student_skills=["Python"],
            required_skills=[],
        )
        assert score == 100.0

    def test_combined_score_returns_dict(self):
        result = self.matcher.combined_score(
            student_skills=["Python", "React"],
            required_skills=["Python", "React", "Docker"],
        )
        assert "match_score" in result
        assert "matched_skills" in result
        assert "missing_skills" in result
        assert "keyword_score" in result
        assert 0 <= result["match_score"] <= 100

    def test_combined_score_missing_skills_correct(self):
        result = self.matcher.combined_score(
            student_skills=["Python"],
            required_skills=["Python", "Docker", "Kubernetes"],
        )
        assert "Docker" in result["missing_skills"]
        assert "Kubernetes" in result["missing_skills"]
        assert "Python" in result["matched_skills"]

    def test_rank_jobs_cgpa_filter(self):
        """Jobs requiring higher CGPA than student's should be excluded."""
        from unittest.mock import MagicMock

        job_easy = MagicMock()
        job_easy.id = "j1"; job_easy.title = "Easy Role"; job_easy.company = "Corp"
        job_easy.min_cgpa = 6.0; job_easy.departments = []; job_easy.skills_required = ["Python"]
        job_easy.description = ""; job_easy.location = ""; job_easy.job_type = "full-time"
        job_easy.salary_range = ""; job_easy.application_url = ""; job_easy.deadline = None

        job_hard = MagicMock()
        job_hard.id = "j2"; job_hard.title = "Hard Role"; job_hard.company = "Corp"
        job_hard.min_cgpa = 9.5; job_hard.departments = []; job_hard.skills_required = ["Python"]
        job_hard.description = ""; job_hard.location = ""; job_hard.job_type = "full-time"
        job_hard.salary_range = ""; job_hard.application_url = ""; job_hard.deadline = None

        results = self.matcher.rank_jobs(
            student_skills=["Python"],
            student_cgpa=7.0,
            student_dept="CSE",
            jobs=[job_easy, job_hard],
        )
        ids = [r["job_id"] for r in results]
        assert "j1" in ids
        assert "j2" not in ids  # filtered out by CGPA gate

    def test_rank_jobs_department_filter(self):
        """Jobs restricted to other departments should be excluded."""
        from unittest.mock import MagicMock

        job = MagicMock()
        job.id = "j1"; job.title = "ECE Only"; job.company = "Corp"
        job.min_cgpa = 0.0; job.departments = ["ECE"]; job.skills_required = []
        job.description = ""; job.location = ""; job.job_type = "full-time"
        job.salary_range = ""; job.application_url = ""; job.deadline = None

        results = self.matcher.rank_jobs(
            student_skills=["Python"],
            student_cgpa=8.0,
            student_dept="CSE",
            jobs=[job],
        )
        assert len(results) == 0


# ── Helper utilities ──────────────────────────────────────────────────────────

class TestHelpers:

    def test_normalize_phone_10_digits(self):
        assert normalize_phone("9876543210") == "+919876543210"

    def test_normalize_phone_with_spaces(self):
        assert normalize_phone("+91 98765 43210") == "+919876543210"

    def test_normalize_phone_with_zero(self):
        assert normalize_phone("09876543210") == "+919876543210"

    def test_days_until_future(self):
        future = datetime.now(timezone.utc) + timedelta(days=5)
        assert days_until(future) == 5

    def test_days_until_past(self):
        past = datetime.now(timezone.utc) - timedelta(days=1)
        assert days_until(past) == 0

    def test_truncate_text_short(self):
        assert truncate_text("Hello", 100) == "Hello"

    def test_truncate_text_long(self):
        result = truncate_text("A" * 200, 50)
        assert len(result) <= 50
        assert result.endswith("…")

    def test_slugify_basic(self):
        assert slugify("Google India") == "google-india"

    def test_slugify_special_chars(self):
        assert slugify("AI & ML Engineer!") == "ai-ml-engineer"

    def test_safe_float_valid(self):
        assert safe_float("8.4") == 8.4

    def test_safe_float_invalid(self):
        assert safe_float("not-a-number") == 0.0

    def test_safe_float_none(self):
        assert safe_float(None, default=5.0) == 5.0

    def test_format_indian_phone(self):
        result = format_indian_phone("+919876543210")
        assert result == "+91 98765 43210"

    def test_deadline_urgency_today(self):
        now = datetime.now(timezone.utc)
        label = deadline_urgency(now + timedelta(hours=2))
        assert "today" in label

    def test_deadline_urgency_days(self):
        future = datetime.now(timezone.utc) + timedelta(days=10)
        label = deadline_urgency(future)
        assert "10" in label
