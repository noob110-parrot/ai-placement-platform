"""
Seed script — populates the database with demo data for the live demo.
Run: python scripts/seed_demo.py
"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.models import Student, Job, Application, Deadline, Notice, Base
from app.core.config import settings
from datetime import datetime, timezone, timedelta
import uuid

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:

        # ── Students ──────────────────────────────────────────────────────────
        students_data = [
            {"roll_no": "CS21B047", "name": "Aryan Mehta",      "email": "aryan.mehta2024@gmail.com",   "phone": "+919876543210", "department": "Computer Science & Engineering", "year_of_study": 4, "cgpa": 8.4, "skills": ["Python", "React", "SQL", "Machine Learning", "FastAPI"]},
            {"roll_no": "CS21B023", "name": "Priya Sharma",     "email": "priya.sharma2024@gmail.com",  "phone": "+919876543211", "department": "Computer Science & Engineering", "year_of_study": 4, "cgpa": 9.1, "skills": ["Java", "Spring Boot", "AWS", "Docker", "Kubernetes"]},
            {"roll_no": "EC21B014", "name": "Rohan Verma",      "email": "rohan.verma2024@gmail.com",   "phone": "+919876543212", "department": "Electronics & Communication Engineering", "year_of_study": 4, "cgpa": 7.8, "skills": ["C++", "VLSI", "Embedded Systems", "Python"]},
            {"roll_no": "IT21B031", "name": "Sneha Patel",      "email": "sneha.patel2024@gmail.com",   "phone": "+919876543213", "department": "Information Technology",         "year_of_study": 4, "cgpa": 8.0, "skills": ["React", "Node.js", "MongoDB", "TypeScript"]},
            {"roll_no": "CS21B055", "name": "Vikram Singh",     "email": "vikram.singh2024@gmail.com",  "phone": "+919876543214", "department": "Computer Science & Engineering", "year_of_study": 4, "cgpa": 7.5, "skills": ["Python", "Data Science", "TensorFlow", "SQL"]},
        ]

        student_objs = []
        for s in students_data:
            student = Student(**s)
            db.add(student)
            student_objs.append(student)

        await db.flush()

        # ── Jobs ──────────────────────────────────────────────────────────────
        jobs_data = [
            {"title": "Software Engineer Intern", "company": "Google India",   "skills_required": ["Python", "Algorithms", "Data Structures"], "min_cgpa": 7.5, "departments": ["Computer Science & Engineering", "Information Technology"], "deadline": datetime.now(timezone.utc) + timedelta(days=8)},
            {"title": "SDE Intern",                "company": "Microsoft",      "skills_required": ["C++", "Python", "System Design"],           "min_cgpa": 7.0, "departments": ["Computer Science & Engineering"], "deadline": datetime.now(timezone.utc) + timedelta(days=11)},
            {"title": "Data Analyst Intern",       "company": "Amazon",         "skills_required": ["SQL", "Python", "Statistics"],              "min_cgpa": 7.0, "departments": ["Computer Science & Engineering", "Information Technology"], "deadline": datetime.now(timezone.utc) + timedelta(days=16)},
            {"title": "Full Stack Developer",      "company": "Flipkart",       "skills_required": ["React", "Node.js", "PostgreSQL"],            "min_cgpa": 6.5, "departments": ["Computer Science & Engineering", "Information Technology"], "deadline": datetime.now(timezone.utc) + timedelta(days=5)},
        ]

        job_objs = []
        for j in jobs_data:
            job = Job(**j)
            db.add(job)
            job_objs.append(job)

        await db.flush()

        # ── Deadlines ─────────────────────────────────────────────────────────
        aryan = student_objs[0]
        deadlines_data = [
            {"student_id": aryan.id, "title": "[DEADLINE] Google India — SE Intern Application Due", "company": "Google India", "role": "Software Engineer Intern", "deadline_at": datetime.now(timezone.utc) + timedelta(days=8),  "priority": "high",   "whatsapp_sent": True,  "calendar_event_id": "gcal_demo_001"},
            {"student_id": aryan.id, "title": "[DEADLINE] Microsoft — SDE Intern Application Due",   "company": "Microsoft",    "role": "SDE Intern",              "deadline_at": datetime.now(timezone.utc) + timedelta(days=11), "priority": "normal", "whatsapp_sent": True,  "calendar_event_id": "gcal_demo_002"},
            {"student_id": aryan.id, "title": "[DEADLINE] Amazon — SDE-I Application Due",           "company": "Amazon",       "role": "SDE-I",                   "deadline_at": datetime.now(timezone.utc) + timedelta(days=16), "priority": "urgent", "whatsapp_sent": False, "calendar_event_id": None},
        ]

        for d in deadlines_data:
            db.add(Deadline(**d))

        # ── Notices ───────────────────────────────────────────────────────────
        notice = Notice(
            title="TCS NQT Deadline Extension Notice",
            raw_content="This is to inform all final-year students of CSE, ECE and IT that TCS iON has extended its NQT registration deadline from 20th March to 28th March 2026...",
            summary_bullets=[
                "TCS NQT registration deadline extended to 28 March 2026 — register at tcsion.com (min CGPA 7.0, no active backlogs)",
                "Online proctored test scheduled 1–5 April 2026; bring valid government photo ID and admit card",
                "Mandatory prep session: 26 March at 3:00 PM in Seminar Hall B — all registered candidates must attend",
            ],
            target_departments=["Computer Science & Engineering", "Electronics & Communication Engineering", "Information Technology"],
            target_years=[4],
            broadcast_channels=["whatsapp", "email", "dashboard"],
            recipients_count=142,
            whatsapp_delivered=139,
            emails_sent=142,
            is_broadcast=True,
            broadcast_at=datetime.now(timezone.utc),
            created_by="Placement Coordinator",
        )
        db.add(notice)

        await db.commit()
        print("✅ Demo data seeded successfully!")
        print(f"   → {len(students_data)} students")
        print(f"   → {len(jobs_data)} jobs")
        print(f"   → {len(deadlines_data)} deadlines for Aryan Mehta")
        print(f"   → 1 broadcast notice")


if __name__ == "__main__":
    asyncio.run(seed())
