"""Shopping list (Daftar Belanja) and expense logging."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.security import current_user
from app.services import recipes as svc

router = APIRouter(tags=["cart & expenses"])
CATS = {"Sayuran", "Protein", "Bumbu", "Karbo"}


class CartIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    qty: float = Field(1, gt=0)
    unit: str = Field("pcs", max_length=20)
    price: int = Field(0, ge=0)
    category: str = "Bumbu"


class CartPatch(BaseModel):
    done: bool | None = None
    qty: float | None = Field(None, gt=0)
    price: int | None = Field(None, ge=0)


class ExpenseIn(BaseModel):
    amount: int = Field(ge=0, le=10_000_000)
    recipe_id: int | None = None
    note: str = Field("", max_length=120)


def cart_out(c: models.CartItem) -> dict:
    return {"id": c.id, "name": c.name, "qty": c.qty, "unit": c.unit, "price": c.price, "cat": c.category, "done": c.done}


def _list(db: Session, user: models.User) -> list[dict]:
    rows = db.scalars(select(models.CartItem).where(models.CartItem.user_id == user.id).order_by(models.CartItem.id))
    return [cart_out(c) for c in rows]


@router.get("/cart")
def get_cart(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return _list(db, user)


@router.post("/cart")
def add_item(body: CartIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    cat = body.category if body.category in CATS else "Bumbu"
    db.add(models.CartItem(user_id=user.id, name=body.name.strip(), qty=body.qty, unit=body.unit, price=body.price, category=cat))
    db.commit()
    return _list(db, user)


@router.post("/cart/from-recipe/{recipe_id}")
def add_recipe(recipe_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """Add every ingredient of a recipe; same name + unit is merged instead of duplicated."""
    r = svc.load_recipe(db, recipe_id)
    if not r:
        raise HTTPException(404, "Resep tidak ditemukan")
    existing = {(c.name, c.unit): c for c in db.scalars(select(models.CartItem).where(models.CartItem.user_id == user.id))}
    for it in r.items:
        ing = it.ingredient
        price = svc.item_price(it)
        c = existing.get((ing.name, ing.unit))
        if c:
            c.qty += it.qty
            c.price += price
            c.done = False
        else:
            c = models.CartItem(user_id=user.id, name=ing.name, qty=it.qty, unit=ing.unit, price=price, category=ing.category)
            db.add(c)
            existing[(ing.name, ing.unit)] = c
    db.commit()
    return _list(db, user)


@router.patch("/cart/{item_id}")
def patch_item(item_id: int, body: CartPatch, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    c = db.get(models.CartItem, item_id)
    if not c or c.user_id != user.id:
        raise HTTPException(404, "Item tidak ditemukan")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(c, k, v)
    db.commit()
    return _list(db, user)


@router.delete("/cart/{item_id}")
def delete_item(item_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    c = db.get(models.CartItem, item_id)
    if not c or c.user_id != user.id:
        raise HTTPException(404, "Item tidak ditemukan")
    db.delete(c)
    db.commit()
    return _list(db, user)


@router.delete("/cart")
def clear_done(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """Remove all items that are already bought (checked)."""
    db.execute(delete(models.CartItem).where(models.CartItem.user_id == user.id, models.CartItem.done.is_(True)))
    db.commit()
    return _list(db, user)


@router.post("/expenses")
def add_expense(body: ExpenseIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    e = models.Expense(user_id=user.id, amount=body.amount, budget=user.daily_budget, recipe_id=body.recipe_id, note=body.note)
    db.add(e)
    db.commit()
    return {"id": e.id, "amount": e.amount}


@router.get("/expenses")
def list_expenses(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(models.Expense).where(models.Expense.user_id == user.id).order_by(models.Expense.created_at.desc()).limit(30)
    )
    return [{"id": e.id, "amount": e.amount, "budget": e.budget, "recipe_id": e.recipe_id, "created_at": e.created_at.isoformat()} for e in rows]
