"""Redis cache utility — rate limiting, session store, job queue."""

import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _redis


class CacheService:
    """Simple async Redis cache with JSON serialization."""

    def __init__(self, prefix: str = "placement"):
        self.prefix = prefix

    def _key(self, key: str) -> str:
        return f"{self.prefix}:{key}"

    async def get(self, key: str) -> Optional[Any]:
        try:
            r = await get_redis()
            val = await r.get(self._key(key))
            return json.loads(val) if val else None
        except Exception as e:
            logger.warning(f"Cache GET error [{key}]: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        try:
            r = await get_redis()
            await r.setex(self._key(key), ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.warning(f"Cache SET error [{key}]: {e}")
            return False

    async def delete(self, key: str) -> bool:
        try:
            r = await get_redis()
            await r.delete(self._key(key))
            return True
        except Exception as e:
            logger.warning(f"Cache DELETE error [{key}]: {e}")
            return False

    async def incr(self, key: str, ttl: int = 60) -> int:
        """Increment a counter — used for rate limiting."""
        try:
            r = await get_redis()
            pipe = r.pipeline()
            full_key = self._key(key)
            await pipe.incr(full_key)
            await pipe.expire(full_key, ttl)
            results = await pipe.execute()
            return results[0]
        except Exception as e:
            logger.warning(f"Cache INCR error [{key}]: {e}")
            return 0


async def rate_limit(identifier: str, limit: int = 10, window: int = 60) -> bool:
    """
    Simple rate limiter.
    Returns True if the request is allowed, False if rate limited.
    """
    cache = CacheService(prefix="ratelimit")
    count = await cache.incr(identifier, ttl=window)
    return count <= limit
