"""Shared utility helpers for the AI Placement Platform backend."""

import re
import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional


def generate_id() -> str:
    """Generate a new UUID4 string."""
    return str(uuid.uuid4())


def normalize_phone(phone: str) -> str:
    """
    Normalize a phone number to E.164 format.
    Handles Indian numbers with/without country code.

    Examples:
        "9876543210"      → "+919876543210"
        "+91 98765 43210" → "+919876543210"
        "09876543210"     → "+919876543210"
    """
    # Strip all non-digit characters
    digits = re.sub(r"\D", "", phone)

    # Indian number without country code (10 digits starting with 6-9)
    if len(digits) == 10 and digits[0] in "6789":
        return f"+91{digits}"

    # Indian number with leading 0
    if len(digits) == 11 and digits[0] == "0":
        return f"+91{digits[1:]}"

    # Already has country code
    if len(digits) >= 11:
        return f"+{digits}"

    return phone  # Return as-is if we can't normalize


def days_until(dt: datetime) -> int:
    """Return the number of days until a datetime."""
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = dt - now
    return max(0, delta.days)


def truncate_text(text: str, max_length: int = 100, suffix: str = "…") -> str:
    """Truncate text to max_length, appending suffix if truncated."""
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)] + suffix


def slugify(text: str) -> str:
    """Convert a string to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def hash_string(value: str) -> str:
    """Return a SHA-256 hex digest of a string."""
    return hashlib.sha256(value.encode()).hexdigest()


def safe_float(value, default: float = 0.0) -> float:
    """Safely convert a value to float, returning default on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def format_indian_phone(phone: str) -> str:
    """Format a phone number for display: +91 98765 43210"""
    normalized = normalize_phone(phone)
    if normalized.startswith("+91") and len(normalized) == 13:
        digits = normalized[3:]
        return f"+91 {digits[:5]} {digits[5:]}"
    return phone


def deadline_urgency(deadline: datetime) -> str:
    """Return a human-readable urgency label for a deadline."""
    days = days_until(deadline)
    if days == 0:
        return "today"
    elif days == 1:
        return "tomorrow"
    elif days <= 3:
        return f"{days} days — urgent"
    elif days <= 7:
        return f"{days} days"
    elif days <= 30:
        return f"{days} days"
    else:
        return deadline.strftime("%d %b %Y")


def paginate(query, page: int = 1, per_page: int = 20) -> dict:
    """Return pagination metadata for an offset/limit query."""
    offset = (page - 1) * per_page
    return {
        "offset":   offset,
        "limit":    per_page,
        "page":     page,
        "per_page": per_page,
    }


def build_whatsapp_payload(phone: str, message: str, phone_number_id: str, token: str) -> dict:
    """Build the JSON payload for a WhatsApp Cloud API message send."""
    return {
        "url": f"https://graph.facebook.com/v19.0/{phone_number_id}/messages",
        "headers": {"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        "body": {
            "messaging_product": "whatsapp",
            "recipient_type":    "individual",
            "to":                phone,
            "type":              "text",
            "text":              {"preview_url": True, "body": message},
        },
    }
