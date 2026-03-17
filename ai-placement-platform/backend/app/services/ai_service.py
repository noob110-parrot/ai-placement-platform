"""AI service — notice summarization, resume parsing, job matching."""

import logging
from dataclasses import dataclass
from typing import List
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class NoticeSummary:
    bullets: List[str]
    title: str


class AIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def summarize_notice(self, raw_text: str) -> NoticeSummary:
        """
        Generate exactly 3 bullet-point summary of a college notice.
        Uses GPT to extract the most important actionable information.
        """
        prompt = f"""You are a university placement cell assistant.
Summarize the following college notice into EXACTLY 3 concise bullet points.
Each bullet must be actionable and include key details (dates, requirements, venues).
Format: Return ONLY 3 lines, each starting with a bullet symbol •

Notice:
{raw_text}

3-bullet summary:"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.3,
            )
            text = response.choices[0].message.content.strip()
            bullets = [
                line.lstrip("•-* ").strip()
                for line in text.split("\n")
                if line.strip() and len(line.strip()) > 5
            ][:3]

            # Ensure we always have 3 bullets
            while len(bullets) < 3:
                bullets.append("See full notice for additional details")

            title = await self.extract_notice_title(raw_text)
            return NoticeSummary(bullets=bullets, title=title)

        except Exception as e:
            logger.error(f"AI summarization error: {e}")
            # Fallback: split raw text into 3 parts
            sentences = [s.strip() for s in raw_text.split(".") if len(s.strip()) > 20]
            bullets = sentences[:3] if len(sentences) >= 3 else [raw_text[:200]]
            return NoticeSummary(bullets=bullets, title="College Notice")

    async def extract_notice_title(self, raw_text: str) -> str:
        """Extract or generate a concise title for a notice."""
        prompt = f"""Extract a concise title (max 8 words) for this notice:

{raw_text[:500]}

Title only, no quotes:"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=30,
                temperature=0.2,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return "College Notice"

    async def parse_resume(self, resume_text: str) -> dict:
        """
        Parse resume text and extract structured information.
        Returns skills, experience, education, and a fit score.
        """
        prompt = f"""Parse this resume and return a JSON object with:
- name: string
- email: string
- phone: string
- skills: array of strings
- education: array of objects (degree, institution, year, cgpa)
- experience: array of objects (company, role, duration, description)
- projects: array of strings
- certifications: array of strings

Resume:
{resume_text[:3000]}

Return ONLY valid JSON, no markdown:"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.1,
            )
            import json
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Resume parsing error: {e}")
            return {"skills": [], "education": [], "experience": []}

    async def compute_skill_gap(
        self, student_skills: List[str], required_skills: List[str]
    ) -> dict:
        """
        Compute skill gap between student and job requirements.
        Returns gap analysis and learning recommendations.
        """
        matched = [s for s in required_skills if s.lower() in
                   [sk.lower() for sk in student_skills]]
        missing = [s for s in required_skills if s.lower() not in
                   [sk.lower() for sk in student_skills]]
        score = round((len(matched) / len(required_skills)) * 100, 1) if required_skills else 100.0

        prompt = f"""A student has these skills: {', '.join(student_skills)}
A job requires: {', '.join(required_skills)}
Missing skills: {', '.join(missing)}

Suggest 3 specific learning resources (course name + platform) for the missing skills.
Format: JSON array of objects with "skill", "resource", "platform", "url" fields.
Return ONLY valid JSON array:"""

        recommendations = []
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.4,
            )
            import json
            recommendations = json.loads(response.choices[0].message.content.strip())
        except Exception:
            recommendations = [{"skill": s, "resource": f"Learn {s}", "platform": "Coursera"} for s in missing[:3]]

        return {
            "readiness_score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "recommendations": recommendations,
        }

    async def compute_placement_readiness_score(
        self,
        cgpa: float,
        skills_count: int,
        applications_count: int,
        interviews_cleared: int,
        certifications_count: int,
    ) -> float:
        """
        Dynamic Placement Readiness Score (0-100).
        Weighted composite of academic + activity signals.
        """
        cgpa_score = min((cgpa / 10.0) * 30, 30)          # 30 pts
        skills_score = min(skills_count * 2, 20)            # 20 pts
        activity_score = min(applications_count * 1.5, 25)  # 25 pts
        interview_score = min(interviews_cleared * 5, 15)   # 15 pts
        cert_score = min(certifications_count * 2, 10)      # 10 pts
        total = cgpa_score + skills_score + activity_score + interview_score + cert_score
        return round(min(total, 100), 1)
