"""n8n and external webhook receivers."""
from fastapi import APIRouter, Request, HTTPException
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/whatsapp")
async def whatsapp_verify(request: Request):
    """WhatsApp Cloud API webhook verification."""
    params = dict(request.query_params)
    if params.get("hub.verify_token") == settings.WHATSAPP_VERIFY_TOKEN:
        return int(params.get("hub.challenge", 0))
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/whatsapp")
async def whatsapp_incoming(request: Request):
    """Receive incoming WhatsApp messages."""
    body = await request.json()
    logger.info(f"WhatsApp webhook: {body}")
    return {"status": "received"}

@router.post("/n8n/deadline-complete")
async def n8n_deadline_complete(request: Request):
    """Callback from n8n after deadline reminder dispatched."""
    body = await request.json()
    logger.info(f"n8n deadline callback: deadline_id={body.get('deadline_id')}")
    return {"status": "acknowledged"}

@router.post("/n8n/broadcast-complete")
async def n8n_broadcast_complete(request: Request):
    """Callback from n8n after notice broadcast complete."""
    body = await request.json()
    logger.info(f"n8n broadcast callback: notice_id={body.get('notice_id')}, delivered={body.get('delivered')}")
    return {"status": "acknowledged"}
