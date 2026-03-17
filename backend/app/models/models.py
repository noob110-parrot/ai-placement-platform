"""SQLAlchemy ORM Models for AI Placement Platform."""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text,
    ForeignKey, Enum, ARRAY, JSON, func
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ── Enums ─────────────────────────────────────────────────────────────────────

class PriorityLevel(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class ApplicationStatus(str, enum.Enum):
    SAVED = "saved"
    APPLIED = "applied"
    OA = "oa"           # Online Assessment
    INTERVIEW = "interview"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class NotificationChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    DASHBOARD = "dashboard"
    SMS = "sms"


class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"


# ── Models ────────────────────────────────────────────────────────────────────

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=gen_uuid)
    roll_no = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=False)
    department = Column(String(100), nullable=False)
    year_of_study = Column(Integer, nullable=False)
    cgpa = Column(Float, nullable=False)
    skills = Column(ARRAY(String), default=[])
    resume_url = Column(String(500), nullable=True)
    placement_score = Column(Float, default=0.0)
    google_calendar_token = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    is_placed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="student", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="student", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(200), nullable=False)
    company = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(ARRAY(String), default=[])
    skills_required = Column(ARRAY(String), default=[])
    min_cgpa = Column(Float, default=0.0)
    location = Column(String(100), nullable=True)
    job_type = Column(String(50), default="full-time")  # full-time, internship, contract
    salary_range = Column(String(100), nullable=True)
    application_url = Column(String(500), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    departments = Column(ARRAY(String), default=[])  # eligible departments
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=gen_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    job_id = Column(String, ForeignKey("jobs.id"), nullable=True)
    company = Column(String(150), nullable=False)
    role = Column(String(200), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SAVED)
    applied_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    resume_score = Column(Float, nullable=True)
    match_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    student = relationship("Student", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    deadlines = relationship("Deadline", back_populates="application")


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(String, primary_key=True, default=gen_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    application_id = Column(String, ForeignKey("applications.id"), nullable=True)
    title = Column(String(300), nullable=False)
    company = Column(String(150), nullable=False)
    role = Column(String(200), nullable=False)
    deadline_at = Column(DateTime(timezone=True), nullable=False)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.NORMAL)
    application_url = Column(String(500), nullable=True)
    calendar_event_id = Column(String(200), nullable=True)
    reminder_sent = Column(Boolean, default=False)
    whatsapp_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="deadlines")
    application = relationship("Application", back_populates="deadlines")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String(300), nullable=False)
    raw_content = Column(Text, nullable=False)
    summary_bullets = Column(ARRAY(String), default=[])
    target_departments = Column(ARRAY(String), default=[])
    target_years = Column(ARRAY(Integer), default=[])
    broadcast_channels = Column(ARRAY(String), default=[])
    recipients_count = Column(Integer, default=0)
    whatsapp_delivered = Column(Integer, default=0)
    emails_sent = Column(Integer, default=0)
    is_broadcast = Column(Boolean, default=False)
    broadcast_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    channel = Column(Enum(NotificationChannel), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    subject = Column(String(300), nullable=True)
    body = Column(Text, nullable=False)
    notification_metadata = Column(JSON, default={}, name="metadata")
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="notifications")
