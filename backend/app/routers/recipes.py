"""Recipe generation, details, cheaper swaps and saved recipes."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.security import current_user
from app.services import recipes as svc

router = APIRouter(tags=["recipes"])


class GenerateIn(BaseModel):
    budget: int | None = Field(None, ge=1000, le=1_000_000)
    filters: list[str] | None = None
    nonce: int | None = None


class SwapIn(BaseModel):
    ingredient_id: int


@router.post("/recipes/generate")
def generate(body: GenerateIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """3 recipes that fit the budget. Uses the user's saved budget/prefs when not given."""
    budget = body.budget or user.daily_budget
    filters = body.filters if body.filters is not None else (user.prefs or [])
    return svc.generate(db, budget, filters, user.allergies, body.nonce)


@router.get("/recipes/today")
def today(budget: int = 15000, db: Session = Depends(get_db)):
    return svc.today_picks(db, budget)


@router.get("/recipes/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    r = svc.load_recipe(db, recipe_id)
    if not r:
        raise HTTPException(404, "Resep tidak ditemukan")
    return svc.recipe_out(r)


@router.post("/recipes/{recipe_id}/swap")
def swap(recipe_id: int, body: SwapIn, db: Session = Depends(get_db)):
    """Replace one ingredient with its cheaper alternative. Returns the new (variant) recipe."""
    r = svc.load_recipe(db, recipe_id)
    if not r:
        raise HTTPException(404, "Resep tidak ditemukan")
    item = next((i for i in r.items if i.ingredient_id == body.ingredient_id), None)
    if not item or not item.ingredient.swap_to_id:
        raise HTTPException(400, "Bahan ini tidak punya alternatif lebih murah")
    return svc.recipe_out(svc.make_variant(db, r, {body.ingredient_id}))


# ---- saved recipes ----------------------------------------------------------

@router.get("/saved")
def saved(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    ids = db.scalars(
        select(models.SavedRecipe.recipe_id).where(models.SavedRecipe.user_id == user.id).order_by(models.SavedRecipe.created_at.desc())
    )
    return [svc.recipe_out(r) for i in ids if (r := svc.load_recipe(db, i))]


@router.post("/saved/{recipe_id}")
def save(recipe_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    if not db.get(models.Recipe, recipe_id):
        raise HTTPException(404, "Resep tidak ditemukan")
    exists = db.scalar(
        select(models.SavedRecipe).where(models.SavedRecipe.user_id == user.id, models.SavedRecipe.recipe_id == recipe_id)
    )
    if not exists:
        db.add(models.SavedRecipe(user_id=user.id, recipe_id=recipe_id))
        db.commit()
    return {"ok": True}


@router.delete("/saved/{recipe_id}")
def unsave(recipe_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    row = db.scalar(
        select(models.SavedRecipe).where(models.SavedRecipe.user_id == user.id, models.SavedRecipe.recipe_id == recipe_id)
    )
    if row:
        db.delete(row)
        db.commit()
    return {"ok": True}
