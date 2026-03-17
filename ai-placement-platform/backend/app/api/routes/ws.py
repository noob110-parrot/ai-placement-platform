"""WebSocket endpoint for real-time dashboard push notifications."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.utils.websocket_manager import ws_manager
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{student_id}")
async def websocket_endpoint(websocket: WebSocket, student_id: str):
    """
    Real-time notification channel per student.

    Connect from the frontend:
      const ws = new WebSocket(`ws://localhost:8000/ws/${studentId}`)
      ws.onmessage = (e) => console.log(JSON.parse(e.data))

    Messages sent by the server:
      { type: "deadline_alert", company: "Google", role: "SWE", deadline_at: "..." }
      { type: "job_match",      jobs: [...] }
      { type: "notice",         title: "...", bullets: [...] }
      { type: "broadcast",      message: "..." }
    """
    await ws_manager.connect(student_id, websocket)
    try:
        # Send a welcome ping
        await ws_manager.send_to_student(student_id, {
            "type": "connected",
            "message": "Real-time notifications active",
            "student_id": student_id,
        })

        # Keep the connection alive, listening for client pings
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(student_id, websocket)
        logger.info(f"Student {student_id} disconnected from WebSocket")


@router.get("/ws/stats")
async def websocket_stats():
    """Diagnostic endpoint — how many live WebSocket connections."""
    return {
        "total_connections": ws_manager.total_connections,
        "connected_students": ws_manager.connected_students,
    }
