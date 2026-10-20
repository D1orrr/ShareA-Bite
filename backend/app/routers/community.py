"""Community feed (posts, likes, bookmarks, comments) and cheap spots."""
import base64
import binascii
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import get_db
from app.security import current_user
from app.util import ago, local_now

router = APIRouter(tags=["community"])
TYPES = {"Resep", "Info Warung", "Trik Masak"}
MAX_IMAGE = 5 * 1024 * 1024


class PostIn(BaseModel):
    type: str = "Resep"
    title: str = Field(min_length=1, max_length=160)
    body: str = Field("", max_length=2000)
    cost: int | None = Field(None, ge=0)
    cook_time: str | None = Field(None, max_length=40)
    per_portion: str | None = Field(None, max_length=40)
    location: str | None = Field(None, max_length=160)
    recipe_id: int | None = None
    image: str | None = None  # data URL "data:image/jpeg;base64,...."


class CommentIn(BaseModel):
    text: str = Field(min_length=1, max_length=500)


def _save_image(data_url: str) -> str:
    try:
        header, b64 = data_url.split(",", 1)
        ext = "png" if "png" in header else "webp" if "webp" in header else "jpg"
        raw = base64.b64decode(b64, validate=False)
    except (ValueError, binascii.Error):
        raise HTTPException(400, "Format gambar tidak valid")
    if len(raw) > MAX_IMAGE:
        raise HTTPException(413, "Foto terlalu besar (maks 5 MB)")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4().hex}.{ext}"
    with open(os.path.join(settings.UPLOAD_DIR, name), "wb") as f:
        f.write(raw)
    return f"/api/uploads/{name}"


def _post_out(db: Session, p: models.Post, user: models.User) -> dict:
    reacts = db.execute(
        select(models.PostReaction.kind, func.count()).where(models.PostReaction.post_id == p.id).group_by(models.PostReaction.kind)
    ).all()
    counts = dict(reacts)
    mine = set(
        db.scalars(select(models.PostReaction.kind).where(models.PostReaction.post_id == p.id, models.PostReaction.user_id == user.id))
    )
    comments = db.scalar(select(func.count()).where(models.Comment.post_id == p.id)) or 0
    return {
        "id": p.id,
        "author": p.author_name,
        "campus": p.campus,
        "time": ago(p.created_at),
        "type": p.type,
        "recipe_id": p.recipe_id,
        "image_url": p.image_url,
        "cost": p.cost,
        "title": p.title,
        "body": p.body,
        "location": p.location,
        "cook_time": p.cook_time,
        "per_portion": p.per_portion,
        "likes": p.base_likes + counts.get("like", 0),
        "liked": "like" in mine,
        "saved": "save" in mine,
        "comments": comments,
        "mine": p.user_id == user.id,
    }


@router.get("/posts")
def list_posts(
    type: str | None = None,
    q: str | None = None,
    max_cost: int | None = None,
    saved: bool = False,
    user: models.User = Depends(current_user),
    db: Session = Depends(get_db),
):
    stmt = select(models.Post).order_by(models.Post.created_at.desc())
    if type:
        stmt = stmt.where(models.Post.type == type)
    if q:
        stmt = stmt.where(models.Post.title.ilike(f"%{q}%"))
    if max_cost is not None:
        stmt = stmt.where(models.Post.cost.is_not(None), models.Post.cost < max_cost)
    if saved:
        ids = select(models.PostReaction.post_id).where(models.PostReaction.user_id == user.id, models.PostReaction.kind == "save")
        stmt = stmt.where(models.Post.id.in_(ids))
    return [_post_out(db, p, user) for p in db.scalars(stmt.limit(100))]


@router.post("/posts")
def create_post(body: PostIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    p = models.Post(
        user_id=user.id,
        author_name=user.name,
        campus=(user.campus.split(",")[0] if user.campus else ""),
        type=body.type if body.type in TYPES else "Resep",
        title=body.title.strip(),
        body=body.body.strip(),
        cost=body.cost,
        cook_time=body.cook_time,
        per_portion=body.per_portion,
        location=body.location,
        recipe_id=body.recipe_id,
        image_url=_save_image(body.image) if body.image else None,
    )
    db.add(p)
    db.commit()
    return _post_out(db, p, user)


@router.delete("/posts/{post_id}")
def delete_post(post_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    p = db.get(models.Post, post_id)
    if not p or p.user_id != user.id:
        raise HTTPException(404, "Postingan tidak ditemukan")
    for model in (models.PostReaction, models.Comment):
        for row in db.scalars(select(model).where(model.post_id == post_id)):
            db.delete(row)
    db.delete(p)
    db.commit()
    return {"ok": True}


def _toggle(db: Session, user: models.User, post_id: int, kind: str) -> dict:
    p = db.get(models.Post, post_id)
    if not p:
        raise HTTPException(404, "Postingan tidak ditemukan")
    row = db.scalar(
        select(models.PostReaction).where(
            models.PostReaction.user_id == user.id, models.PostReaction.post_id == post_id, models.PostReaction.kind == kind
        )
    )
    if row:
        db.delete(row)
    else:
        db.add(models.PostReaction(user_id=user.id, post_id=post_id, kind=kind))
    db.commit()
    return _post_out(db, p, user)


@router.post("/posts/{post_id}/like")
def like(post_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return _toggle(db, user, post_id, "like")


@router.post("/posts/{post_id}/save")
def bookmark(post_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return _toggle(db, user, post_id, "save")


@router.get("/posts/{post_id}/comments")
def comments(post_id: int, db: Session = Depends(get_db)):
    rows = db.scalars(select(models.Comment).where(models.Comment.post_id == post_id).order_by(models.Comment.created_at))
    return [{"id": c.id, "author": c.author_name, "text": c.text, "time": ago(c.created_at)} for c in rows]


@router.post("/posts/{post_id}/comments")
def add_comment(post_id: int, body: CommentIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    if not db.get(models.Post, post_id):
        raise HTTPException(404, "Postingan tidak ditemukan")
    db.add(models.Comment(post_id=post_id, user_id=user.id, author_name=user.name, text=body.text.strip()))
    db.commit()
    return comments(post_id, db)


# ---- spots -------------------------------------------------------------------

def _is_open(s: models.Spot) -> bool:
    hm = local_now().strftime("%H:%M")
    return s.open_from <= hm < s.open_to


@router.get("/spots")
def spots(tags: str = "", open_now: bool = False, db: Session = Depends(get_db)):
    """Cheap places. `tags` is a comma list (Nasi,Sayur,Protein); all must match."""
    wanted = [t for t in tags.split(",") if t]
    out = []
    for s in db.scalars(select(models.Spot).order_by(models.Spot.id)):
        is_open = _is_open(s)
        if open_now and not is_open:
            continue
        if any(t not in s.tags for t in wanted):
            continue
        out.append(
            {
                "id": s.id,
                "name": s.name,
                "distance": s.distance,
                "hours": f"{s.open_from.replace(':', '.')} sampai {s.open_to.replace(':', '.')}",
                "price": s.price,
                "rating": f"{s.rating:.1f}".replace(".", ","),
                "tags": s.tags + (["Buka sekarang"] if is_open else []),
                "open_now": is_open,
                "city": s.city,
            }
        )
    return out
