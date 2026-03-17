"""WebSocket connection manager for real-time dashboard push notifications."""

import logging
import json
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections per student."""

    def __init__(self):
        # student_id → list of active WebSocket connections
        self._connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, student_id: str, websocket: WebSocket):
        await websocket.accept()
        if student_id not in self._connections:
            self._connections[student_id] = []
        self._connections[student_id].append(websocket)
        logger.info(f"WS connected: student={student_id}, total={self.total_connections}")

    def disconnect(self, student_id: str, websocket: WebSocket):
        if student_id in self._connections:
            self._connections[student_id] = [
                ws for ws in self._connections[student_id] if ws != websocket
            ]
            if not self._connections[student_id]:
                del self._connections[student_id]
        logger.info(f"WS disconnected: student={student_id}")

    async def send_to_student(self, student_id: str, message: dict):
        """Push a notification to all browser tabs of a specific student."""
        sockets = self._connections.get(student_id, [])
        dead = []
        for ws in sockets:
            try:
                await ws.send_json({**message, "timestamp": datetime.now(timezone.utc).isoformat()})
            except Exception:
                dead.append(ws)
        # Clean up dead connections
        for ws in dead:
            self.disconnect(student_id, ws)

    async def broadcast(self, message: dict, student_ids: List[str] = None):
        """Broadcast to all connected students, or a specific list."""
        targets = student_ids if student_ids else list(self._connections.keys())
        for sid in targets:
            await self.send_to_student(sid, message)

    @property
    def total_connections(self) -> int:
        return sum(len(v) for v in self._connections.values())

    @property
    def connected_students(self) -> List[str]:
        return list(self._connections.keys())


# Global singleton
ws_manager = ConnectionManager()
