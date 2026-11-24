"""Subscription tiers and the limits that come with them.

`None` means unlimited. Paid tiers are switched in demo mode (no payment gateway yet):
POST /me/plan sets the tier for 30 days.
"""
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models
from app.util import local_now

FAIR_USE_PER_DAY = 200  # safety cap even on "unlimited" plans (protects the AI quota)

PLANS: dict[str, dict] = {
    "free": {
        "name": "Free",
        "price": 0,
        "tagline": "Coba dulu, gratis selamanya",
        "generate_per_day": 3,
        "swap_per_day": 3,
        "saved_max": 10,
        "posts_per_week": 2,
        "history_days": 7,
        "ai": False,
        "badge": False,
        "perks": [
            "3x generate resep per hari",
            "3x swap bahan hemat per hari",
            "Simpan sampai 10 resep",
            "Posting komunitas 2x seminggu",
            "Grafik pengeluaran 7 hari",
        ],
    },
    "canteen": {
        "name": "Canteen",
        "price": 9900,
        "tagline": "Buat yang masak hampir tiap hari",
        "generate_per_day": 10,
        "swap_per_day": 15,
        "saved_max": 50,
        "posts_per_week": 7,
        "history_days": 30,
        "ai": True,
        "badge": False,
        "perks": [
            "10x generate resep per hari",
            "Resep personal dari AI",
            "15x swap bahan hemat per hari",
            "Simpan sampai 50 resep",
            "Posting komunitas 7x seminggu",
            "Grafik pengeluaran 30 hari",
        ],
    },
    "brunch": {
        "name": "Brunch",
        "price": 19900,
        "tagline": "Paling pas buat anak kos aktif",
        "generate_per_day": 30,
        "swap_per_day": None,
        "saved_max": 200,
        "posts_per_week": None,
        "history_days": 90,
        "ai": True,
        "badge": True,
        "perks": [
            "30x generate resep per hari",
            "Resep personal dari AI",
            "Swap bahan hemat tanpa batas",
            "Simpan sampai 200 resep",
            "Posting komunitas tanpa batas",
            "Grafik pengeluaran 90 hari",
            "Badge Brunch di komunitas",
        ],
    },
    "gala": {
        "name": "Gala Dinner",
        "price": 34900,
        "tagline": "Semua fitur, tanpa batas",
        "generate_per_day": None,
        "swap_per_day": None,
        "saved_max": None,
        "posts_per_week": None,
        "history_days": 365,
        "ai": True,
        "badge": True,
        "perks": [
            "Generate resep sepuasnya",
            "Resep personal dari AI (prioritas)",
            "Swap bahan hemat tanpa batas",
            "Simpan resep tanpa batas",
            "Posting komunitas tanpa batas",
            "Grafik pengeluaran 1 tahun",
            "Badge Gala Dinner di komunitas",
        ],
    },
}
ORDER = ["free", "canteen", "brunch", "gala"]


def tier_of(user: models.User) -> str:
    """Current tier; a paid tier that has expired falls back to free."""
    t = user.tier if user.tier in PLANS else "free"
    if t != "free" and user.tier_until:
        until = user.tier_until if user.tier_until.tzinfo else user.tier_until.replace(tzinfo=timezone.utc)
        if until < datetime.now(timezone.utc):
            return "free"
    return t


def plan_of(user: models.User) -> dict:
    return PLANS[tier_of(user)]


def _day_start_utc() -> datetime:
    now = local_now()
    return now.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)


def used_today(db: Session, user: models.User, kind: str) -> int:
    return db.scalar(
        select(func.count()).where(
            models.Usage.user_id == user.id, models.Usage.kind == kind, models.Usage.created_at >= _day_start_utc()
        )
    ) or 0


def posts_this_week(db: Session, user: models.User) -> int:
    since = datetime.now(timezone.utc) - timedelta(days=7)
    return db.scalar(select(func.count()).where(models.Post.user_id == user.id, models.Post.created_at >= since)) or 0


def saved_count(db: Session, user: models.User) -> int:
    return db.scalar(select(func.count()).where(models.SavedRecipe.user_id == user.id)) or 0


def _limit_error(kind: str, user: models.User, message: str) -> HTTPException:
    return HTTPException(
        429,
        {"code": "limit", "kind": kind, "tier": tier_of(user), "message": message},
    )


def use(db: Session, user: models.User, kind: str) -> None:
    """Check today's quota for `kind` (generate | swap) and record one use. Raises 429 when used up."""
    plan = plan_of(user)
    limit = plan[f"{kind}_per_day"]
    cap = limit if limit is not None else FAIR_USE_PER_DAY
    if used_today(db, user, kind) >= cap:
        what = "generate resep" if kind == "generate" else "swap bahan"
        if limit is None:
            raise _limit_error(kind, user, f"Batas wajar {cap}x {what} per hari tercapai. Coba lagi besok ya.")
        raise _limit_error(
            kind, user, f"Kuota {what} paket {plan['name']} hari ini sudah habis ({limit}x). Upgrade paket atau coba lagi besok."
        )
    db.add(models.Usage(user_id=user.id, kind=kind))
    db.commit()


def check_saved(db: Session, user: models.User) -> None:
    plan = plan_of(user)
    if plan["saved_max"] is not None and saved_count(db, user) >= plan["saved_max"]:
        raise _limit_error(
            "saved", user, f"Paket {plan['name']} bisa simpan maksimal {plan['saved_max']} resep. Hapus beberapa atau upgrade paket."
        )


def check_post(db: Session, user: models.User) -> None:
    plan = plan_of(user)
    if plan["posts_per_week"] is not None and posts_this_week(db, user) >= plan["posts_per_week"]:
        raise _limit_error(
            "post", user, f"Paket {plan['name']} bisa posting {plan['posts_per_week']}x seminggu. Upgrade paket untuk posting lagi."
        )


def plan_public(key: str) -> dict:
    p = PLANS[key]
    return {"key": key, **{k: v for k, v in p.items()}}


def my_plan(db: Session, user: models.User) -> dict:
    key = tier_of(user)
    p = PLANS[key]

    def meter(used: int, limit: int | None) -> dict:
        return {"used": used, "limit": limit, "left": None if limit is None else max(0, limit - used)}

    return {
        "tier": key,
        "plan": plan_public(key),
        "until": user.tier_until.isoformat() if key != "free" and user.tier_until else None,
        "usage": {
            "generate": meter(used_today(db, user, "generate"), p["generate_per_day"]),
            "swap": meter(used_today(db, user, "swap"), p["swap_per_day"]),
            "saved": meter(saved_count(db, user), p["saved_max"]),
            "posts_week": meter(posts_this_week(db, user), p["posts_per_week"]),
        },
    }
