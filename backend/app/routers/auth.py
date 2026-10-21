"""Register / login / guest sessions and the current user's profile & stats."""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.security import create_token, current_user, hash_password, verify_password
from app.util import local_now, to_local

router = APIRouter(tags=["auth & profile"])


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProfileIn(BaseModel):
    name: str | None = Field(None, max_length=80)
    campus: str | None = Field(None, max_length=120)
    daily_budget: int | None = Field(None, ge=1000, le=1_000_000)
    shop_budget: int | None = Field(None, ge=1000, le=5_000_000)
    prefs: list[str] | None = None
    allergies: str | None = Field(None, max_length=255)
    reminder_time: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")


def user_out(u: models.User) -> dict:
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "is_guest": u.is_guest,
        "campus": u.campus,
        "daily_budget": u.daily_budget,
        "shop_budget": u.shop_budget,
        "prefs": u.prefs or [],
        "allergies": u.allergies,
        "reminder_time": u.reminder_time,
    }


def session_out(u: models.User) -> dict:
    return {"token": create_token(u.id), "user": user_out(u)}


@router.post("/auth/register")
def register(body: RegisterIn, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalar(select(models.User).where(models.User.email == email)):
        raise HTTPException(409, "Email sudah terdaftar, silakan masuk.")
    u = models.User(name=body.name.strip(), email=email, password_hash=hash_password(body.password))
    db.add(u)
    db.commit()
    return session_out(u)


@router.post("/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    u = db.scalar(select(models.User).where(models.User.email == body.email.lower()))
    if not u or not verify_password(body.password, u.password_hash):
        raise HTTPException(401, "Email atau password salah.")
    return session_out(u)


@router.post("/auth/guest")
def guest(db: Session = Depends(get_db)):
    u = models.User(name="Kawan", is_guest=True, prefs=["Halal", "Kompor"])
    db.add(u)
    db.commit()
    return session_out(u)


@router.get("/me")
def me(user: models.User = Depends(current_user)):
    return user_out(user)


@router.put("/me")
def update_me(body: ProfileIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(user, k, v.strip() if isinstance(v, str) else v)
    db.commit()
    return user_out(user)


LEVELS = ["Anak Kos Baru", "Anak Kos Hemat", "Anak Kos Pintar", "Master Masak Air", "Sultan Warteg", "Legenda Tanggal Tua"]


@router.get("/me/stats")
def stats(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    expenses = list(
        db.scalars(select(models.Expense).where(models.Expense.user_id == user.id).order_by(models.Expense.created_at))
    )
    now = local_now()
    today = now.date()
    month_start = today.replace(day=1)
    today_spent = sum(e.amount for e in expenses if to_local(e.created_at).date() == today)
    month = [e for e in expenses if to_local(e.created_at).date() >= month_start]
    saved_month = sum(max(0, e.budget - e.amount) for e in month)
    under = sum(1 for e in expenses if e.amount <= e.budget)

    saved_count = db.scalar(select(func.count()).where(models.SavedRecipe.user_id == user.id)) or 0
    shared = db.scalar(select(func.count()).where(models.Post.user_id == user.id)) or 0
    bought = db.scalar(select(func.count()).where(models.CartItem.user_id == user.id, models.CartItem.done.is_(True))) or 0

    xp = 20 * len(expenses) + 30 * shared + 5 * saved_count + 5 * bought
    level = min(len(LEVELS), 1 + xp // 100)

    # Daily totals for the last 7 days that have entries
    by_day: dict = {}
    for e in expenses:
        d = to_local(e.created_at).date()
        if d > today - timedelta(days=30):
            by_day.setdefault(d, [0, e.budget])
            by_day[d][0] += e.amount
    history = [
        {"date": d.isoformat(), "amount": a, "budget": b} for d, (a, b) in sorted(by_day.items())[-7:]
    ]

    badges = [
        {"key": "hemat", "label": "Hemat Hero", "icon": "premium", "earned": under >= 3, "hint": "Masak 3x di bawah budget"},
        {"key": "pedas", "label": "Spice Lord", "icon": "fire", "earned": "Pedas" in (user.prefs or []) and len(expenses) >= 1, "hint": "Suka pedas & sudah masak"},
        {"key": "pasar", "label": "Pasar Hunter", "icon": "basket", "earned": bought >= 3, "hint": "Centang 3 bahan belanja"},
    ]
    return {
        "today_spent": today_spent,
        "history": history,
        "saved_count": saved_count,
        "shared_count": shared,
        "saved_this_month": saved_month,
        "cook_count": len(expenses),
        "xp": xp,
        "level": level,
        "level_title": f"Lv.{level} {LEVELS[level - 1]}",
        "next_level_xp": level * 100,
        "badges": badges,
    }
