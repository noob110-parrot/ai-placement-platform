"""
Semantic Job Matching Service.

Uses Sentence Transformers to compute semantic similarity between
student skill profiles and job descriptions — goes beyond keyword matching.
"""

import logging
from typing import List, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class MatchResult:
    job_id:          str
    title:           str
    company:         str
    match_score:     float         # 0–100
    matched_skills:  List[str]
    missing_skills:  List[str]
    semantic_score:  float         # raw cosine similarity 0–1
    keyword_score:   float         # keyword overlap 0–100


class JobMatcherService:
    """
    Two-stage job matching:
      1. Keyword overlap (fast eligibility filter)
      2. Sentence-transformer semantic similarity (re-ranking)
    """

    _model = None   # lazy-loaded

    @classmethod
    def _get_model(cls):
        """Lazy-load the sentence transformer model."""
        if cls._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                cls._model = SentenceTransformer("all-MiniLM-L6-v2")
                logger.info("Sentence transformer model loaded: all-MiniLM-L6-v2")
            except Exception as e:
                logger.warning(f"Could not load sentence transformer: {e}. Falling back to keyword matching.")
                cls._model = None
        return cls._model

    def keyword_score(self, student_skills: List[str], required_skills: List[str]) -> float:
        """Fast keyword overlap score (0–100)."""
        if not required_skills:
            return 100.0
        student_lower  = {s.lower() for s in student_skills}
        required_lower = {s.lower() for s in required_skills}
        matched = student_lower & required_lower
        return round((len(matched) / len(required_lower)) * 100, 1)

    def semantic_score(self, student_skills: List[str], job_description: str) -> float:
        """
        Compute semantic similarity between student profile text and job description.
        Falls back to 0.5 if model is unavailable.
        """
        model = self._get_model()
        if model is None:
            return 0.5

        try:
            import numpy as np
            profile_text = "Skills: " + ", ".join(student_skills)
            embeddings   = model.encode([profile_text, job_description], normalize_embeddings=True)
            similarity   = float(np.dot(embeddings[0], embeddings[1]))
            return max(0.0, min(1.0, similarity))
        except Exception as e:
            logger.warning(f"Semantic scoring error: {e}")
            return 0.5

    def combined_score(
        self,
        student_skills:    List[str],
        required_skills:   List[str],
        job_description:   str = "",
        keyword_weight:    float = 0.7,
        semantic_weight:   float = 0.3,
    ) -> Dict[str, Any]:
        """
        Combined match score:
          score = (keyword_weight × keyword_score) + (semantic_weight × semantic_score × 100)
        """
        kw_score   = self.keyword_score(student_skills, required_skills)
        sem_score  = self.semantic_score(student_skills, job_description) if job_description else 0.5
        final      = round((keyword_weight * kw_score) + (semantic_weight * sem_score * 100), 1)

        student_lower  = {s.lower() for s in student_skills}
        required_lower = {s.lower() for s in required_skills}
        matched  = [s for s in required_skills if s.lower() in student_lower]
        missing  = [s for s in required_skills if s.lower() not in student_lower]

        return {
            "match_score":     min(final, 100.0),
            "keyword_score":   kw_score,
            "semantic_score":  round(sem_score * 100, 1),
            "matched_skills":  matched,
            "missing_skills":  missing,
        }

    def rank_jobs(
        self,
        student_skills: List[str],
        student_cgpa:   float,
        student_dept:   str,
        jobs:           List[Any],
        top_n:          int = 10,
    ) -> List[Dict]:
        """
        Rank a list of Job ORM objects for a specific student.
        Applies eligibility gates then scores and sorts.
        """
        results = []
        for job in jobs:
            # Eligibility gates
            if job.min_cgpa and student_cgpa < job.min_cgpa:
                continue
            if job.departments and student_dept not in job.departments:
                continue

            score_data = self.combined_score(
                student_skills  = student_skills,
                required_skills = job.skills_required or [],
                job_description = job.description or "",
            )

            results.append({
                "job_id":          job.id,
                "title":           job.title,
                "company":         job.company,
                "location":        job.location,
                "job_type":        job.job_type,
                "salary_range":    job.salary_range,
                "application_url": job.application_url,
                "deadline":        job.deadline.isoformat() if job.deadline else None,
                **score_data,
            })

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results[:top_n]
