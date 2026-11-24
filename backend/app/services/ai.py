"""Recipe generation with Google Gemini.

- Several free-tier models are tried in order; each has its own daily quota, so a model
  that runs out (429) or does not exist (404) is skipped and the next one is used.
- The model may only use ingredients from our price table. Costs are always recomputed
  by the backend, and anything over budget, off-diet or with unknown ingredients is dropped.
- Results are cached per (budget, filters, allergies) so repeated requests reuse earlier
  AI recipes instead of spending quota.
- Every failure is caught by the caller, which falls back to the rule-based generator.
"""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models
from app.config import settings

log = logging.getLogger(__name__)

TOOLS = ["Rice cooker", "Kompor", "Microwave"]
COLORS = ["#F4B82E", "#7FBF8F", "#F2A27E", "#E9B955", "#C98B4E", "#8FA9B8"]
CALL_TIMEOUT_S = 8.0  # per model call; keeps the whole request under the 10 s serverless limit
TOTAL_BUDGET_S = 9.0  # stop trying further models after this long
BATCHES_PER_KEY = 3  # AI calls per identical request before we only serve cached batches

# Per-process model health: model -> unix time until which it is skipped
_skip_until: dict[str, float] = {}
status: dict = {"model": None, "at": None, "error": None}


def models_to_try() -> list[str]:
    return [m for m in settings.gemini_models if _skip_until.get(m, 0) <= time.time()]


def _next_pacific_midnight() -> float:
    """Gemini daily quotas reset at midnight Pacific time."""
    now = datetime.now(ZoneInfo("America/Los_Angeles"))
    return (now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)).timestamp()


# --------------------------------------------------------------------------- #
# Model call (the only part that talks to Google; tests replace it)           #
# --------------------------------------------------------------------------- #

class ModelError(Exception):
    def __init__(self, kind: str, msg: str):
        super().__init__(msg)
        self.kind = kind  # quota | missing | bad_request | other


SCHEMA = {
    "type": "object",
    "properties": {
        "recipes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "minutes": {"type": "integer"},
                    "tip": {"type": "string"},
                    "tools": {"type": "array", "items": {"type": "string", "enum": TOOLS}},
                    "dish": {"type": "string", "enum": ["nasi", "lauk", "kuah"]},
                    "ingredients": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "qty": {"type": "number"},
                                "step": {"type": "integer"},
                            },
                            "required": ["name", "qty", "step"],
                        },
                    },
                    "steps": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {"text": {"type": "string"}, "seconds": {"type": "integer"}},
                            "required": ["text", "seconds"],
                        },
                    },
                },
                "required": ["title", "minutes", "tip", "tools", "dish", "ingredients", "steps"],
            },
        }
    },
    "required": ["recipes"],
}


def call_model(model: str, prompt: str, timeout_s: float) -> str:  # pragma: no cover - network
    from google import genai
    from google.genai import errors, types

    client = genai.Client(
        api_key=settings.GEMINI_API_KEY.strip(),
        http_options=types.HttpOptions(
            api_version="v1beta",  # structured output and thinking settings live on v1beta
            timeout=int(timeout_s * 1000),
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    )
    # From most to least specific. A model that rejects an option (400) is retried with
    # the next, simpler config; our own validation catches anything the model gets wrong.
    configs = [
        dict(response_mime_type="application/json", response_json_schema=SCHEMA, temperature=0.9,
             thinking_config=types.ThinkingConfig(thinking_level="minimal")),
        dict(response_mime_type="application/json", response_json_schema=SCHEMA, temperature=0.9),
        dict(response_mime_type="application/json", temperature=0.9),
        dict(temperature=0.9),
    ]
    json_hint = "\n\nBalas HANYA JSON dengan bentuk: " + json.dumps(SCHEMA, ensure_ascii=False)
    last: errors.APIError | None = None
    for i, cfg in enumerate(configs):
        try:
            resp = client.models.generate_content(
                model=model,
                contents=prompt if i < 2 else prompt + json_hint,
                config=types.GenerateContentConfig(**cfg),
            )
            return _strip_fences(resp.text or "")
        except errors.APIError as e:
            last = e
            if e.code != 400:
                break
        except Exception as e:  # timeouts, network
            raise ModelError("other", str(e)[:500]) from e
    code = last.code if last else 0
    kind = {429: "quota", 404: "missing", 400: "bad_request", 403: "bad_request"}.get(code, "other")
    raise ModelError(kind, f"{code}: {str(last)[:500]}")


def _strip_fences(text: str) -> str:
    """Models without JSON mode sometimes wrap the answer in ```json fences."""
    t = text.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[1] if "\n" in t else ""
        t = t.rsplit("```", 1)[0]
    return t.strip()


# --------------------------------------------------------------------------- #
# Prompt, validation, persistence                                             #
# --------------------------------------------------------------------------- #

def build_prompt(ings: dict[str, models.Ingredient], budget: int, filters: list[str], allergies: str, bahan_ada: bool, avoid: list[str]) -> str:
    price_list = "\n".join(f"- {n} | Rp{int(i.price_per_unit)} per {i.unit}" for n, i in ings.items())
    tools = [t for t in TOOLS if t in filters] or TOOLS
    prefs = [f for f in filters if f not in TOOLS and f != "Bahan ada"]
    pantry = ", ".join(n for n, i in ings.items() if i.is_pantry)
    return f"""Kamu koki hemat untuk mahasiswa kos di Tangerang Selatan.
Buat 3 resep BERBEDA untuk 1 porsi, bahasa Indonesia santai.

Aturan:
- Total harga bahan maksimal Rp{budget}{f" (bahan dapur {pantry} dianggap sudah punya, tidak dihitung)" if bahan_ada else ""}.
- Alat masak yang ada: {", ".join(tools)}. Isi "tools" hanya dengan alat yang dipakai dan ada di daftar itu.
- Preferensi: {", ".join(prefs) or "bebas"}. "Vegetarian" berarti tanpa daging/ikan/udang. "Pedas" berarti pakai cabai atau sambal.
  "High protein" berarti lauk protein lebih banyak. "Maks 20 mnt" berarti minutes <= 20.
- Alergi (jangan dipakai sama sekali): {allergies or "-"}.
- HANYA pakai bahan dari daftar harga di bawah; tulis "name" persis sama. qty dalam satuan yang tertulis.
- 3 sampai 6 langkah singkat. "seconds" = lama menunggu di langkah itu (0 kalau tidak ada).
- "step" di tiap bahan = nomor langkah (mulai 0) saat bahan itu pertama dipakai.
- "dish": nasi (nasi/telur sebagai menu utama), lauk (tumisan/gorengan), atau kuah (sup/mie berkuah).
- Jangan ulangi resep ini: {", ".join(avoid[:20]) or "-"}.

Daftar harga (nama | harga per satuan):
{price_list}"""


def _pay(items: list[tuple[models.Ingredient, float]], bahan_ada: bool) -> int:
    return int(sum(round(q * i.price_per_unit) for i, q in items if not (bahan_ada and i.is_pantry)))


def parse_recipes(
    db: Session, text: str, ings: dict[str, models.Ingredient], budget: int, filters: list[str], allergies: str, bahan_ada: bool
) -> list[models.Recipe]:
    """Turn the model's JSON into saved recipes, dropping anything that breaks the rules."""
    data = json.loads(text)
    lower = {n.lower(): i for n, i in ings.items()}
    allergy_words = [a.strip().lower() for a in allergies.replace(";", ",").split(",") if a.strip()]
    tools_ok = [t for t in TOOLS if t in filters] or TOOLS
    out: list[models.Recipe] = []
    seen: set[str] = set()
    for rd in data.get("recipes", [])[:6]:
        title = str(rd.get("title", "")).strip()[:120]
        steps = [s for s in rd.get("steps", []) if str(s.get("text", "")).strip()][:8]
        if not title or title.lower() in seen or len(steps) < 2:
            continue
        items: list[tuple[models.Ingredient, float, int]] = []
        for x in rd.get("ingredients", []):
            ing = lower.get(str(x.get("name", "")).strip().lower())
            try:
                qty = float(x.get("qty", 0))
            except (TypeError, ValueError):
                qty = 0
            if not ing or not (0 < qty <= 20):
                items = []
                break  # unknown ingredient or silly amount: reject the recipe
            step = int(x.get("step", 0)) if str(x.get("step", 0)).lstrip("-").isdigit() else 0
            items.append((ing, qty, min(max(step, 0), len(steps) - 1)))
        if not items:
            continue
        if "Vegetarian" in filters and any(i.is_meat for i, _, _ in items):
            continue
        if allergy_words and any(w in i.name.lower() for i, _, _ in items for w in allergy_words):
            continue
        if _pay([(i, q) for i, q, _ in items], bahan_ada) > budget:
            continue  # never trust the model's arithmetic
        tools = [t for t in rd.get("tools", []) if t in tools_ok] or [tools_ok[0]]
        minutes = int(rd.get("minutes", 15) or 15)
        if "Maks 20 mnt" in filters and minutes > 20:
            continue
        dish = rd.get("dish", "lauk")
        art = {"nasi": 1, "kuah": 3}.get(dish, 2)
        r = models.Recipe(
            title=title, art=art, color=COLORS[len(out) % len(COLORS)], minutes=max(3, min(minutes, 120)),
            tip=str(rd.get("tip", ""))[:300], tools=tools, source="ai",
        )
        r.items = [models.RecipeIngredient(ingredient_id=i.id, qty=q, step_idx=s) for i, q, s in items]
        r.steps = [
            models.RecipeStep(idx=k, text=str(s["text"]).strip()[:400], seconds=max(0, min(int(s.get("seconds", 0) or 0), 3600)))
            for k, s in enumerate(steps)
        ]
        db.add(r)
        seen.add(title.lower())
        out.append(r)
    db.commit()
    return out


def _record(db: Session, model: str, ok: bool, detail: str) -> None:
    try:
        db.add(models.AiLog(model=model, ok=ok, detail=detail[:1000]))
        db.commit()
    except Exception:  # logging must never break generation
        db.rollback()


def recent_logs(db: Session, n: int = 5) -> list[dict]:
    rows = db.scalars(select(models.AiLog).order_by(models.AiLog.id.desc()).limit(n))
    return [{"model": r.model, "ok": r.ok, "detail": r.detail, "at": r.created_at.isoformat()} for r in rows]


def cache_key(budget: int, filters: list[str], allergies: str) -> str:
    return f"{round(budget / 500) * 500}|{','.join(sorted(filters))}|{allergies.strip().lower()}"


def cached_batches(db: Session, key: str) -> list[list[int]]:
    since = datetime.now(timezone.utc) - timedelta(days=7)
    rows = db.scalars(
        select(models.AiBatch).where(models.AiBatch.key == key, models.AiBatch.created_at >= since).order_by(models.AiBatch.id)
    )
    return [b.recipe_ids for b in rows]


def generate(db: Session, budget: int, filters: list[str], allergies: str, nonce: int | None) -> tuple[list[int], str]:
    """Recipe ids from Gemini (possibly cached) and the model used ('cache' when reused). Raises on failure."""
    key = cache_key(budget, filters, allergies)
    batches = cached_batches(db, key)
    if len(batches) >= BATCHES_PER_KEY:
        return batches[(nonce or 0) % len(batches)], "cache"

    ings = {i.name: i for i in db.scalars(select(models.Ingredient))}
    avoid = [db.get(models.Recipe, rid).title for b in batches for rid in b if db.get(models.Recipe, rid)]
    prompt = build_prompt(ings, budget, filters, allergies, "Bahan ada" in filters, avoid)

    start = time.monotonic()
    last: Exception | None = None
    for model in models_to_try():
        left = TOTAL_BUDGET_S - (time.monotonic() - start)
        if left < 2:
            break
        try:
            text = call_model(model, prompt, min(CALL_TIMEOUT_S, left))
        except ModelError as e:
            last = e
            if e.kind == "quota":
                _skip_until[model] = _next_pacific_midnight()
            elif e.kind == "missing":
                _skip_until[model] = time.time() + 24 * 3600
            status.update(model=model, at=datetime.now(timezone.utc).isoformat(), error=str(e))
            _record(db, model, False, str(e))
            log.warning("Gemini %s failed (%s), trying the next model", model, e)
            continue
        try:
            recipes = parse_recipes(db, text, ings, budget, filters, allergies, "Bahan ada" in filters)
        except (ValueError, TypeError, AttributeError) as e:  # not JSON / wrong shape
            db.rollback()
            _record(db, model, False, f"unreadable answer: {e}: {text[:300]}")
            last = e
            continue
        status.update(model=model, at=datetime.now(timezone.utc).isoformat(), error=None)
        _record(db, model, bool(recipes), f"{len(recipes)} usable recipes")
        if not recipes:
            raise ValueError(f"{model} returned no usable recipes")
        ids = [r.id for r in recipes]
        db.add(models.AiBatch(key=key, recipe_ids=ids))
        db.commit()
        return ids, model
    raise last or RuntimeError("no Gemini model available")
