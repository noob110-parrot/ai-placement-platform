"""Notification service — WhatsApp Business API and Email."""

import httpx
import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

WHATSAPP_API_URL = "https://graph.facebook.com/v19.0"


class NotificationService:

    # ── WhatsApp ──────────────────────────────────────────────────────────────

    async def send_welcome_whatsapp(self, student) -> bool:
        """Send welcome message to newly registered student."""
        message = (
            f"🎓 *Welcome to AI Placement Platform!*\n\n"
            f"Hey {student.name}! 👋\n\n"
            f"Your profile is now active.\n"
            f"✅ Roll No: {student.roll_no}\n"
            f"✅ Department: {student.department}\n"
            f"✅ Notifications: *Enabled*\n\n"
            f"You'll receive deadline alerts, job matches, and placement updates here.\n\n"
            f"— Your Placement Cell 🏛️"
        )
        return await self.send_whatsapp(student.phone, message)

    async def send_deadline_alert(
        self,
        phone: str,
        name: str,
        company: str,
        role: str,
        deadline_at: datetime,
        priority: str,
        application_url: str = "",
    ) -> bool:
        """Send deadline reminder via WhatsApp."""
        priority_emoji = {"high": "🔴", "urgent": "🚨", "normal": "🟡", "low": "🟢"}.get(priority, "🟡")
        deadline_str = deadline_at.strftime("%d %b %Y, %I:%M %p IST")

        message = (
            f"Hey {name}! 👋\n\n"
            f"⏰ *DEADLINE ALERT*\n"
            f"Company: *{company}*\n"
            f"Role: {role}\n"
            f"Deadline: *{deadline_str}*\n\n"
            f"{priority_emoji} *{priority.upper()} PRIORITY* — Don't miss this!\n"
        )
        if application_url:
            message += f"\nApply here:\n{application_url}\n"
        message += "\n✅ Added to your Google Calendar\n\n— Your Placement Cell"

        return await self.send_whatsapp(phone, message)

    async def send_notice_broadcast(
        self,
        phone: str,
        name: str,
        title: str,
        bullets: list,
    ) -> bool:
        """Broadcast a notice summary via WhatsApp."""
        bullets_text = "\n".join(f"• {b}" for b in bullets)
        message = (
            f"📢 *PLACEMENT NOTICE*\n"
            f"_{title}_\n\n"
            f"{bullets_text}\n\n"
            f"— Placement Cell 🏛️"
        )
        return await self.send_whatsapp(phone, message)

    async def send_whatsapp(self, phone: str, message: str) -> bool:
        """
        Send a WhatsApp message via Meta's Cloud API.
        Delivers within 30 seconds via n8n workflow.
        """
        if not settings.ENABLE_WHATSAPP_NOTIFICATIONS:
            logger.info(f"WhatsApp disabled — skipping message to {phone}")
            return False

        url = f"{WHATSAPP_API_URL}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
        headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "text",
            "text": {"preview_url": True, "body": message},
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                logger.info(f"WhatsApp sent to {phone}")
                return True
        except Exception as e:
            logger.error(f"WhatsApp error for {phone}: {e}")
            return False

    # ── Email ─────────────────────────────────────────────────────────────────

    async def send_deadline_email(
        self,
        email: str,
        name: str,
        company: str,
        role: str,
        deadline_at: datetime,
        application_url: str = "",
    ) -> bool:
        """Send deadline reminder email."""
        if not settings.ENABLE_EMAIL_NOTIFICATIONS:
            return False

        deadline_str = deadline_at.strftime("%A, %d %B %Y at %I:%M %p IST")
        subject = f"⏰ Deadline Reminder: {company} — {role}"
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2>🎓 AI Placement Platform</h2>
                <p>Deadline Alert</p>
            </div>
            <div style="padding: 24px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                <p>Hi <strong>{name}</strong>,</p>
                <p>This is a reminder about an upcoming application deadline:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px; font-weight: bold;">Company</td>
                        <td style="padding: 10px;">{company}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Role</td>
                        <td style="padding: 10px;">{role}</td>
                    </tr>
                    <tr style="background: #f5f5f5;">
                        <td style="padding: 10px; font-weight: bold;">Deadline</td>
                        <td style="padding: 10px; color: #d32f2f;"><strong>{deadline_str}</strong></td>
                    </tr>
                </table>
                {'<a href="' + application_url + '" style="background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Apply Now →</a>' if application_url else ''}
                <p style="color: #666; margin-top: 24px; font-size: 12px;">
                    This event has been added to your Google Calendar with reminders.
                </p>
            </div>
        </div>
        """

        return await self._send_email(email, subject, html_body)

    async def _send_email(self, to: str, subject: str, html_body: str) -> bool:
        """Send HTML email via Gmail SMTP."""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                start_tls=True,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
            )
            logger.info(f"Email sent to {to}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Email error for {to}: {e}")
            return False
