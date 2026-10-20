"""Small shared helpers: Jakarta time, relative time labels."""
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.config import settings

TZ = ZoneInfo(settings.TIMEZONE)


def local_now() -> datetime:
    return datetime.now(TZ)


def to_local(dt: datetime) -> datetime:
    if dt.tzinfo is None:  # SQLite returns naive datetimes; they are stored as UTC
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(TZ)


def ago(dt: datetime) -> str:
    """Indonesian relative time label, e.g. '2 jam lalu'."""
    secs = (local_now() - to_local(dt)).total_seconds()
    if secs < 60:
        return "Baru saja"
    if secs < 3600:
        return f"{int(secs // 60)} menit lalu"
    if secs < 86400:
        return f"{int(secs // 3600)} jam lalu"
    days = int(secs // 86400)
    return "Kemarin" if days == 1 else f"{days} hari lalu"
