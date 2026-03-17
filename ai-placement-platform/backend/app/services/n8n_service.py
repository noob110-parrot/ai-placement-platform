"""N8n automation service — triggers workflows via webhooks."""

import httpx
import logging
from datetime import datetime
from typing import List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class N8nService:
    def __init__(self):
        self.base_url = settings.N8N_WEBHOOK_URL
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": settings.N8N_API_KEY,
        }

    async def trigger_deadline_added(
        self,
        student_id: str,
        name: str,
        phone: str,
        email: str,
        company: str,
        role: str,
        deadline_at: datetime,
        priority: str,
        application_url: str,
        deadline_id: str,
    ) -> dict:
        """
        Trigger the 'Deadline Reminder Dispatcher' workflow.
        Sends WhatsApp message within 30 seconds.
        """
        payload = {
            "student_id": student_id,
            "name": name,
            "phone": phone,
            "email": email,
            "company": company,
            "role": role,
            "deadline": deadline_at.isoformat(),
            "priority": priority,
            "application_url": application_url,
            "deadline_id": deadline_id,
            "trigger": "deadline_added",
        }
        return await self._post("/webhook/deadline-added", payload)

    async def trigger_notice_broadcast(
        self,
        notice_id: str,
        title: str,
        bullets: List[str],
        student_phones: List[str],
        student_emails: List[str],
        channels: List[str],
    ) -> dict:
        """
        Trigger the 'Notice Broadcast & AI Summarizer' workflow.
        """
        payload = {
            "notice_id": notice_id,
            "title": title,
            "bullets": bullets,
            "student_phones": student_phones,
            "student_emails": student_emails,
            "channels": channels,
            "trigger": "notice_broadcast",
        }
        return await self._post("/webhook/notice", payload)

    async def trigger_job_alert(
        self,
        student_id: str,
        phone: str,
        email: str,
        jobs: List[dict],
    ) -> dict:
        """Trigger job alert workflow for matched jobs."""
        payload = {
            "student_id": student_id,
            "phone": phone,
            "email": email,
            "matched_jobs": jobs,
            "trigger": "job_alert",
        }
        return await self._post("/webhook/job-alert", payload)

    async def _post(self, path: str, payload: dict) -> dict:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.base_url}{path}",
                    json=payload,
                    headers=self.headers,
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"n8n webhook error [{path}]: {e}")
            return {"error": str(e), "status": "failed"}
