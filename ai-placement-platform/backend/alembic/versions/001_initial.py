"""Initial database schema

Revision ID: 001_initial
Revises:
Create Date: 2026-03-17 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, JSON

revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "students",
        sa.Column("id",                     sa.String(),  primary_key=True),
        sa.Column("roll_no",                sa.String(20), unique=True, nullable=False),
        sa.Column("name",                   sa.String(100), nullable=False),
        sa.Column("email",                  sa.String(150), unique=True, nullable=False),
        sa.Column("phone",                  sa.String(20), nullable=False),
        sa.Column("department",             sa.String(100), nullable=False),
        sa.Column("year_of_study",          sa.Integer(), nullable=False),
        sa.Column("cgpa",                   sa.Float(), nullable=False),
        sa.Column("skills",                 ARRAY(sa.String()), server_default="{}"),
        sa.Column("resume_url",             sa.String(500), nullable=True),
        sa.Column("placement_score",        sa.Float(), server_default="0.0"),
        sa.Column("google_calendar_token",  JSON, nullable=True),
        sa.Column("is_active",              sa.Boolean(), server_default="true"),
        sa.Column("is_placed",              sa.Boolean(), server_default="false"),
        sa.Column("created_at",             sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",             sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    op.create_index("ix_students_roll_no", "students", ["roll_no"])
    op.create_index("ix_students_email",   "students", ["email"])

    op.create_table(
        "jobs",
        sa.Column("id",               sa.String(), primary_key=True),
        sa.Column("title",            sa.String(200), nullable=False),
        sa.Column("company",          sa.String(150), nullable=False),
        sa.Column("description",      sa.Text(), nullable=True),
        sa.Column("requirements",     ARRAY(sa.String()), server_default="{}"),
        sa.Column("skills_required",  ARRAY(sa.String()), server_default="{}"),
        sa.Column("min_cgpa",         sa.Float(), server_default="0.0"),
        sa.Column("location",         sa.String(100), nullable=True),
        sa.Column("job_type",         sa.String(50), server_default="full-time"),
        sa.Column("salary_range",     sa.String(100), nullable=True),
        sa.Column("application_url",  sa.String(500), nullable=True),
        sa.Column("deadline",         sa.DateTime(timezone=True), nullable=True),
        sa.Column("departments",      ARRAY(sa.String()), server_default="{}"),
        sa.Column("is_active",        sa.Boolean(), server_default="true"),
        sa.Column("created_at",       sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "applications",
        sa.Column("id",           sa.String(), primary_key=True),
        sa.Column("student_id",   sa.String(), sa.ForeignKey("students.id"), nullable=False),
        sa.Column("job_id",       sa.String(), sa.ForeignKey("jobs.id"), nullable=True),
        sa.Column("company",      sa.String(150), nullable=False),
        sa.Column("role",         sa.String(200), nullable=False),
        sa.Column("status",       sa.String(50), server_default="saved"),
        sa.Column("applied_at",   sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes",        sa.Text(), nullable=True),
        sa.Column("resume_score", sa.Float(), nullable=True),
        sa.Column("match_score",  sa.Float(), nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",   sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )

    op.create_table(
        "deadlines",
        sa.Column("id",                sa.String(), primary_key=True),
        sa.Column("student_id",        sa.String(), sa.ForeignKey("students.id"), nullable=False),
        sa.Column("application_id",    sa.String(), sa.ForeignKey("applications.id"), nullable=True),
        sa.Column("title",             sa.String(300), nullable=False),
        sa.Column("company",           sa.String(150), nullable=False),
        sa.Column("role",              sa.String(200), nullable=False),
        sa.Column("deadline_at",       sa.DateTime(timezone=True), nullable=False),
        sa.Column("priority",          sa.String(20), server_default="normal"),
        sa.Column("application_url",   sa.String(500), nullable=True),
        sa.Column("calendar_event_id", sa.String(200), nullable=True),
        sa.Column("reminder_sent",     sa.Boolean(), server_default="false"),
        sa.Column("whatsapp_sent",     sa.Boolean(), server_default="false"),
        sa.Column("created_at",        sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "notices",
        sa.Column("id",                  sa.String(), primary_key=True),
        sa.Column("title",               sa.String(300), nullable=False),
        sa.Column("raw_content",         sa.Text(), nullable=False),
        sa.Column("summary_bullets",     ARRAY(sa.String()), server_default="{}"),
        sa.Column("target_departments",  ARRAY(sa.String()), server_default="{}"),
        sa.Column("target_years",        ARRAY(sa.Integer()), server_default="{}"),
        sa.Column("broadcast_channels",  ARRAY(sa.String()), server_default="{}"),
        sa.Column("recipients_count",    sa.Integer(), server_default="0"),
        sa.Column("whatsapp_delivered",  sa.Integer(), server_default="0"),
        sa.Column("emails_sent",         sa.Integer(), server_default="0"),
        sa.Column("is_broadcast",        sa.Boolean(), server_default="false"),
        sa.Column("broadcast_at",        sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by",          sa.String(100), nullable=True),
        sa.Column("created_at",          sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "notifications",
        sa.Column("id",            sa.String(), primary_key=True),
        sa.Column("student_id",    sa.String(), sa.ForeignKey("students.id"), nullable=False),
        sa.Column("channel",       sa.String(50), nullable=False),
        sa.Column("status",        sa.String(50), server_default="pending"),
        sa.Column("subject",       sa.String(300), nullable=True),
        sa.Column("body",          sa.Text(), nullable=False),
        sa.Column("metadata",      JSON, server_default="{}"),
        sa.Column("sent_at",       sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at",  sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at",    sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("notices")
    op.drop_table("deadlines")
    op.drop_table("applications")
    op.drop_table("jobs")
    op.drop_table("students")
