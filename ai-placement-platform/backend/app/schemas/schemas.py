"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import re


# ── Enums ─────────────────────────────────────────────────────────────────────

class PriorityLevel(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class ApplicationStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    OA = "oa"
    INTERVIEW = "interview"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


# ── Student Schemas ───────────────────────────────────────────────────────────

class StudentCreate(BaseModel):
    roll_no: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    department: str = Field(..., min_length=2, max_length=100)
    year_of_study: int = Field(..., ge=1, le=5)
    cgpa: float = Field(..., ge=0.0, le=10.0)
    skills: List[str] = Field(default=[])

    @validator("phone")
    def validate_phone(cls, v):
        # Remove spaces and dashes
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[1-9]\d{9,14}$", cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned

    @validator("email")
    def validate_gmail(cls, v):
        if not v.endswith("@gmail.com"):
            raise ValueError("Only Gmail addresses are supported for Calendar & WhatsApp sync")
        return v.lower()

    class Config:
        json_schema_extra = {
            "example": {
                "roll_no": "CS21B047",
                "name": "Aryan Mehta",
                "email": "aryan.mehta2024@gmail.com",
                "phone": "+919876543210",
                "department": "Computer Science & Engineering",
                "year_of_study": 4,
                "cgpa": 8.4,
                "skills": ["Python", "React", "SQL", "Machine Learning"],
            }
        }


class StudentResponse(BaseModel):
    id: str
    roll_no: str
    name: str
    email: str
    phone: str
    department: str
    year_of_study: int
    cgpa: float
    skills: List[str]
    placement_score: float
    is_placed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    cgpa: Optional[float] = None
    skills: Optional[List[str]] = None


# ── Deadline Schemas ──────────────────────────────────────────────────────────

class DeadlineCreate(BaseModel):
    company: str = Field(..., min_length=1, max_length=150)
    role: str = Field(..., min_length=1, max_length=200)
    deadline_at: datetime
    priority: PriorityLevel = PriorityLevel.NORMAL
    application_url: Optional[str] = None
    application_id: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "company": "Google India",
                "role": "Software Engineer Intern",
                "deadline_at": "2026-03-25T23:59:00+05:30",
                "priority": "high",
                "application_url": "https://careers.google.com/jobs/...",
            }
        }


class DeadlineResponse(BaseModel):
    id: str
    student_id: str
    company: str
    role: str
    deadline_at: datetime
    priority: PriorityLevel
    application_url: Optional[str]
    calendar_event_id: Optional[str]
    reminder_sent: bool
    whatsapp_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Application Schemas ───────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    company: str = Field(..., min_length=1, max_length=150)
    role: str = Field(..., min_length=1, max_length=200)
    job_id: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    student_id: str
    company: str
    role: str
    status: ApplicationStatus
    applied_at: Optional[datetime]
    notes: Optional[str]
    resume_score: Optional[float]
    match_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Notice Schemas ────────────────────────────────────────────────────────────

class NoticeCreate(BaseModel):
    raw_content: str = Field(..., min_length=20)
    target_departments: List[str] = Field(default=[])
    target_years: List[int] = Field(default=[])

    class Config:
        json_schema_extra = {
            "example": {
                "raw_content": "This is to inform all final-year students...",
                "target_departments": ["CSE", "ECE", "IT"],
                "target_years": [4],
            }
        }


class NoticeSummaryResponse(BaseModel):
    id: str
    title: str
    summary_bullets: List[str]
    target_departments: List[str]
    target_years: List[int]
    raw_content: str
    created_at: datetime

    class Config:
        from_attributes = True


class BroadcastRequest(BaseModel):
    notice_id: str
    channels: List[str] = Field(default=["whatsapp", "email", "dashboard"])


class BroadcastResponse(BaseModel):
    notice_id: str
    recipients_targeted: int
    whatsapp_delivered: int
    emails_sent: int
    dashboard_notifications: int
    failed: int
    time_taken_seconds: float
    broadcast_at: datetime


# ── Analytics Schemas ─────────────────────────────────────────────────────────

class PlacementStats(BaseModel):
    total_students: int
    placed_students: int
    placement_percentage: float
    avg_cgpa: float
    total_applications: int
    top_recruiters: List[dict]
    department_breakdown: List[dict]


# ── Token / Auth Schemas ──────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    student_id: Optional[str] = None
