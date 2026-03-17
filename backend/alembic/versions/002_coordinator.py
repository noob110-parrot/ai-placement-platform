"""Add coordinator table and password fields

Revision ID: 002_coordinator
Revises: 001_initial
Create Date: 2026-03-17 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "002_coordinator"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add hashed_password to students for proper auth
    op.add_column("students",
        sa.Column("hashed_password", sa.String(255), nullable=True))

    # Coordinator / admin table
    op.create_table(
        "coordinators",
        sa.Column("id",              sa.String(),      primary_key=True),
        sa.Column("name",            sa.String(100),   nullable=False),
        sa.Column("email",           sa.String(150),   unique=True, nullable=False),
        sa.Column("hashed_password", sa.String(255),   nullable=False),
        sa.Column("department",      sa.String(100),   nullable=True),
        sa.Column("is_active",       sa.Boolean(),     server_default="true"),
        sa.Column("is_superadmin",   sa.Boolean(),     server_default="false"),
        sa.Column("created_at",      sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_coordinators_email", "coordinators", ["email"])

    # Placement offers table for tracking confirmed placements
    op.create_table(
        "placement_offers",
        sa.Column("id",           sa.String(),    primary_key=True),
        sa.Column("student_id",   sa.String(),    sa.ForeignKey("students.id"), nullable=False),
        sa.Column("company",      sa.String(150), nullable=False),
        sa.Column("role",         sa.String(200), nullable=False),
        sa.Column("package_lpa",  sa.Float(),     nullable=True),
        sa.Column("offer_type",   sa.String(50),  server_default="full-time"),
        sa.Column("offer_date",   sa.DateTime(timezone=True), nullable=True),
        sa.Column("joining_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("offer_letter_url", sa.String(500), nullable=True),
        sa.Column("verified",     sa.Boolean(),   server_default="false"),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("placement_offers")
    op.drop_table("coordinators")
    op.drop_column("students", "hashed_password")
