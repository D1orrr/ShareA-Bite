"""Recipe maths (cost, nutrition, tags), cheaper-swap variants and the recipe generator."""
import logging
import random
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app import models
from app.config import settings
from app.services import ai

log = logging.getLogger(__name__)

TOOLS = ["Kompor", "Rice cooker", "Microwave"]


# --------------------------------------------------------------------------- #
# Maths                                                                       #
# --------------------------------------------------------------------------- #

def item_price(it: models.RecipeIngredient) -> int:
    return int(round(it.qty * it.ingredient.price_per_unit))


def recipe_cost(r: models.Recipe) -> int:
    return sum(item_price(i) for i in r.items)


def pantry_cost(r: models.Recipe) -> int:
    """Cost of staples most students already have at the kos (rice, oil, kecap, salt)."""
    return sum(item_price(i) for i in r.items if i.ingredient.is_pantry)


def nutrition(r: models.Recipe) -> tuple[int, int, int, int]:
    kcal = sum(i.qty * i.ingredient.kcal for i in r.items)
    protein = sum(i.qty * i.ingredient.protein for i in r.items)
    carbs = sum(i.qty * i.ingredient.carbs for i in r.items)
    has_veg = any(i.ingredient.category == "Sayuran" for i in r.items)
    score = 50 + min(25, protein * 0.9) + (10 if has_veg else 0) + (5 if 400 <= kcal <= 750 else 0)
    score -= min(15, max(0, kcal - 750) / 20) + (5 if carbs > 90 else 0)
    return round(kcal), round(protein), round(carbs), int(max(30, min(98, score)))


def tags(r: models.Recipe) -> list[str]:
    _, protein, _, _ = nutrition(r)
    t = []
    if protein >= 18:
        t.append("High protein")
    if any(i.ingredient.is_spicy for i in r.items):
        t.append("Pedas")
    if r.minutes <= 20:
        t.append("Maks 20 mnt")
    if r.servings == 1:
        t.append("1 porsi")
    if not any(i.ingredient.is_meat for i in r.items):
        t.append("Vegetarian")
    return t


def recipe_out(r: models.Recipe) -> dict:
    kcal, protein, carbs, score = nutrition(r)
    ings = []
    for it in r.items:
        ing = it.ingredient
        swap = None
        if ing.swap_to:
            new_qty = round(it.qty * ing.swap_ratio, 2)
            new_price = int(round(new_qty * ing.swap_to.price_per_unit))
            if new_price < item_price(it):
                swap = {
                    "to": ing.swap_to.name,
                    "qty": new_qty,
                    "unit": ing.swap_to.unit,
                    "saving": item_price(it) - new_price,
                }
        ings.append(
            {
                "id": ing.id,
                "name": ing.name,
                "qty": it.qty,
                "unit": ing.unit,
                "price": item_price(it),
                "cat": ing.category,
                "pantry": ing.is_pantry,
                "step": it.step_idx,
                "swap": swap,
            }
        )
    return {
        "id": r.id,
        "title": r.title,
        "art": r.art,
        "color": r.color,
        "minutes": r.minutes,
        "servings": r.servings,
        "tip": r.tip,
        "tools": r.tools,
        "source": r.source,
        "parent_id": r.parent_id,
        "ingredients": ings,
        "steps": [{"text": s.text, "seconds": s.seconds} for s in r.steps],
        "cost": recipe_cost(r),
        "pantry_cost": pantry_cost(r),
        "kcal": kcal,
        "protein": protein,
        "carbs": carbs,
        "score": score,
        "tags": tags(r),
    }


def load_recipe(db: Session, recipe_id: int) -> models.Recipe | None:
    return db.scalar(
        select(models.Recipe)
        .where(models.Recipe.id == recipe_id)
        .options(selectinload(models.Recipe.items).selectinload(models.RecipeIngredient.ingredient), selectinload(models.Recipe.steps))
    )


def all_base_recipes(db: Session) -> list[models.Recipe]:
    q = (
        select(models.Recipe)
        .where(models.Recipe.source.in_(["seed", "ai"]))
        .options(selectinload(models.Recipe.items).selectinload(models.RecipeIngredient.ingredient), selectinload(models.Recipe.steps))
    )
    return list(db.scalars(q))


# --------------------------------------------------------------------------- #
# Cheaper swaps                                                               #
# --------------------------------------------------------------------------- #

def make_variant(db: Session, base: models.Recipe, swap_ids: set[int]) -> models.Recipe:
    """Recipe copy with the given ingredients replaced by their cheaper swap.

    Re-uses an identical variant if one already exists, so repeated generates/swaps
    don't pile up rows.
    """
    root = base
    if base.parent_id:
        root = load_recipe(db, base.parent_id) or base

    new_items: list[tuple[int, float, int]] = []
    for it in base.items:
        ing = it.ingredient
        if ing.id in swap_ids and ing.swap_to_id:
            new_items.append((ing.swap_to_id, round(it.qty * ing.swap_ratio, 2), it.step_idx))
        else:
            new_items.append((ing.id, it.qty, it.step_idx))
    sig = sorted((i, q) for i, q, _ in new_items)

    existing = db.scalars(
        select(models.Recipe)
        .where(models.Recipe.parent_id == root.id, models.Recipe.source == "variant")
        .options(selectinload(models.Recipe.items))
    )
    for v in existing:
        if sorted((i.ingredient_id, i.qty) for i in v.items) == sig:
            return load_recipe(db, v.id)

    v = models.Recipe(
        title=root.title if root.title.endswith("(versi hemat)") else f"{root.title} (versi hemat)",
        art=root.art, color=root.color, minutes=root.minutes, servings=root.servings, tip=root.tip,
        tools=root.tools, source="variant", parent_id=root.id,
    )
    v.items = [models.RecipeIngredient(ingredient_id=i, qty=q, step_idx=s) for i, q, s in new_items]
    v.steps = [models.RecipeStep(idx=s.idx, text=s.text, seconds=s.seconds) for s in base.steps]
    db.add(v)
    db.commit()
    return load_recipe(db, v.id)


# --------------------------------------------------------------------------- #
# Generator                                                                   #
# --------------------------------------------------------------------------- #

@dataclass
class Candidate:
    recipe: models.Recipe
    swaps: set[int]
    pay: int  # what the user actually spends
    matches: int  # soft-filter matches


SOFT = ["High protein", "Pedas", "Maks 20 mnt", "1 porsi"]


def _pay(r: models.Recipe, swaps: set[int], bahan_ada: bool) -> int:
    total = 0
    for it in r.items:
        ing = it.ingredient
        if ing.id in swaps and ing.swap_to:
            if bahan_ada and ing.swap_to.is_pantry:
                continue
            total += int(round(it.qty * ing.swap_ratio * ing.swap_to.price_per_unit))
        else:
            if bahan_ada and ing.is_pantry:
                continue
            total += item_price(it)
    return total


def _fit(r: models.Recipe, budget: int, bahan_ada: bool, forced: set[int]) -> tuple[set[int], int] | None:
    """Apply cheaper swaps (biggest saving first) until the recipe fits the budget."""
    swaps = set(forced)
    pay = _pay(r, swaps, bahan_ada)
    if pay <= budget:
        return swaps, pay
    options = []
    for it in r.items:
        ing = it.ingredient
        if ing.swap_to and ing.id not in swaps:
            saving = item_price(it) - int(round(it.qty * ing.swap_ratio * ing.swap_to.price_per_unit))
            if saving > 0:
                options.append((saving, ing.id))
    for _, iid in sorted(options, reverse=True):
        swaps.add(iid)
        pay = _pay(r, swaps, bahan_ada)
        if pay <= budget:
            return swaps, pay
    return None


def generate(
    db: Session,
    budget: int,
    filters: list[str],
    allergies: str = "",
    nonce: int | None = None,
    count: int = 3,
    use_ai: bool = True,
) -> dict:
    """Pick `count` recipes that fit the budget and preferences.

    Tries Gemini first when an API key is configured, otherwise (or on any error)
    uses the rule-based picker over the recipe library.
    """
    ai_out: list[dict] = []
    if use_ai and settings.gemini_enabled:
        try:
            ids, _model = ai.generate(db, budget, filters, allergies, nonce)
            for rid in ids[:count]:
                r = load_recipe(db, rid)
                if r:
                    ai_out.append({**recipe_out(r), "pay": _pay(r, set(), "Bahan ada" in filters)})
        except Exception as e:  # network/LLM failures: fall back to the rule-based picker
            db.rollback()
            log.warning("Gemini generation failed, falling back: %s", e)
    if len(ai_out) >= count:
        return {"recipes": ai_out[:count], "note": "", "engine": "gemini"}

    bahan_ada = "Bahan ada" in filters
    veg = "Vegetarian" in filters
    tools = [t for t in TOOLS if t in filters] or TOOLS
    allergy_words = [a.strip().lower() for a in allergies.replace(";", ",").split(",") if a.strip()]
    wanted = [f for f in SOFT if f in filters]

    cands: list[Candidate] = []
    over: list[Candidate] = []
    for r in all_base_recipes(db):
        if not any(t in tools for t in r.tools):
            continue
        if allergy_words and any(w in i.ingredient.name.lower() for i in r.items for w in allergy_words):
            continue
        forced: set[int] = set()
        if veg:
            for it in r.items:
                if it.ingredient.is_meat:
                    if it.ingredient.swap_to and not it.ingredient.swap_to.is_meat:
                        forced.add(it.ingredient.id)
                    else:
                        forced = {-1}
                        break
            if -1 in forced:
                continue
        rtags = tags(r)
        m = sum(1 for w in wanted if w in rtags)
        fit = _fit(r, budget, bahan_ada, forced)
        if fit:
            cands.append(Candidate(r, fit[0], fit[1], m))
        else:
            over.append(Candidate(r, forced, _pay(r, forced, bahan_ada), m))

    rng = random.Random(nonce)
    rng.shuffle(cands)
    # Prefer recipes matching more filters, then fewer swaps; shuffle breaks ties so
    # "Regenerate" gives a different mix.
    cands.sort(key=lambda c: (-c.matches, len(c.swaps)))
    picked = cands[:count]

    note = ""
    if wanted and picked and any(c.matches < len(wanted) for c in picked):
        note = "Beberapa resep tidak memenuhi semua preferensi, tapi tetap muat di budget."
    if len(picked) < count:
        if not picked:
            over.sort(key=lambda c: c.pay)
            picked = over[:count]
            note = "Belum ada resep yang muat di budget ini. Ini pilihan termurah, coba naikkan budget atau aktifkan 'Bahan ada'."
        else:
            note = f"Cuma {len(picked)} resep yang muat di budget ini. Naikkan budget untuk pilihan lebih banyak."

    out = list(ai_out)
    titles = {x["title"].lower() for x in out}
    for c in picked:
        if len(out) >= count:
            break
        if c.recipe.title.lower() in titles:
            continue
        r = make_variant(db, c.recipe, c.swaps) if c.swaps and -1 not in c.swaps else c.recipe
        out.append({**recipe_out(r), "pay": c.pay})
    if ai_out:  # AI gave fewer than `count`: topped up from the library
        return {"recipes": out, "note": "", "engine": "gemini"}
    return {"recipes": out, "note": note, "engine": "rules"}


def today_picks(db: Session, budget: int, count: int = 3) -> list[dict]:
    """Cheapest recipes that fit today's budget (for 'Pilihan Hemat Hari Ini')."""
    rs = sorted(all_base_recipes(db), key=recipe_cost)
    fit = [r for r in rs if recipe_cost(r) <= budget] or rs
    return [recipe_out(r) for r in fit[:count]]
