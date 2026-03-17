"""Google Calendar integration service."""

import logging
from datetime import datetime, timedelta
from typing import Optional
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from app.core.config import settings

logger = logging.getLogger(__name__)


class CalendarService:
    SCOPES = ["https://www.googleapis.com/auth/calendar"]

    def _get_service(self, token: dict):
        creds = Credentials(
            token=token.get("access_token"),
            refresh_token=token.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=self.SCOPES,
        )
        return build("calendar", "v3", credentials=creds)

    async def create_deadline_event(
        self,
        token: dict,
        title: str,
        deadline_at: datetime,
        company: str,
        role: str,
        application_url: Optional[str] = None,
    ) -> Optional[str]:
        """
        Create a Google Calendar event for an application deadline.
        Returns the created event ID.
        """
        try:
            service = self._get_service(token)

            description = f"""Application Deadline — Added by AI Placement Platform

Company: {company}
Role: {role}
Priority: HIGH
"""
            if application_url:
                description += f"\nApply here: {application_url}"

            event = {
                "summary": title,
                "description": description,
                "start": {
                    "dateTime": deadline_at.isoformat(),
                    "timeZone": "Asia/Kolkata",
                },
                "end": {
                    "dateTime": (deadline_at + timedelta(hours=1)).isoformat(),
                    "timeZone": "Asia/Kolkata",
                },
                "reminders": {
                    "useDefault": False,
                    "overrides": [
                        {"method": "email", "minutes": 24 * 60},   # 1 day before
                        {"method": "popup", "minutes": 60},         # 1 hour before
                    ],
                },
                "colorId": "11",  # Red for high priority
            }

            created = service.events().insert(calendarId="primary", body=event).execute()
            event_id = created.get("id")
            logger.info(f"Calendar event created: {event_id} for {company} — {role}")
            return event_id

        except HttpError as e:
            logger.error(f"Google Calendar API error: {e}")
            return None
        except Exception as e:
            logger.error(f"Calendar service error: {e}")
            return None

    async def get_oauth_url(self) -> str:
        """Generate Google OAuth2 authorization URL."""
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.SCOPES,
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return auth_url

    async def exchange_code_for_token(self, code: str) -> dict:
        """Exchange OAuth code for access + refresh tokens."""
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=self.SCOPES,
        )
        flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
        flow.fetch_token(code=code)
        creds = flow.credentials
        return {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "expiry": creds.expiry.isoformat() if creds.expiry else None,
        }
