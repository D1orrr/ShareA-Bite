"""Gemini path, with the network call replaced by canned answers."""
import json

import pytest

from app.config import settings
from app.services import ai


def recipe(title, ings, dish="lauk", tools=("Kompor",), minutes=15):
    return {
        "title": title,
        "minutes": minutes,
        "tip": "Api kecil saja.",
        "tools": list(tools),
        "dish": dish,
        "ingredients": [{"name": n, "qty": q, "step": s} for n, q, s in ings],
        "steps": [{"text": "Siapkan bahan.", "seconds": 0}, {"text": "Masak sampai matang.", "seconds": 300}],
    }


GOOD = [
    recipe("Telur Sawi Saus Tiram", [("Telur ayam", 2, 1), ("Sawi hijau", 0.5, 1), ("Saus tiram", 1, 1), ("Nasi putih", 1, 0)], "nasi"),
    recipe("Tahu Kecap Bawang", [("Tahu", 2, 0), ("Kecap manis", 1, 1), ("Bawang merah", 2, 0)]),
    recipe("Sup Wortel Tahu", [("Wortel", 1, 0), ("Tahu", 2, 1), ("Kaldu bubuk", 1, 1)], "kuah"),
]


@pytest.fixture
def gemini(monkeypatch):
    """Turn on the AI path; `calls` records (model, prompt) and `answers` maps model -> answer or exception."""
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(settings, "GEMINI_MODEL", "")
    ai._skip_until.clear()
    calls, answers = [], {}

    def fake(model, prompt, timeout_s):
        calls.append((model, prompt))
        a = answers.get(model, answers.get("*"))
        if isinstance(a, Exception):
            raise a
        return json.dumps({"recipes": a})

    monkeypatch.setattr(ai, "call_model", fake)
    return calls, answers


def gen(client, h, budget=15000, filters=None, nonce=1):
    return client.post("/api/recipes/generate", json={"budget": budget, "filters": filters or [], "nonce": nonce}, headers=h).json()


def test_ai_recipes_are_used_and_priced_by_backend(client, member, gemini):
    calls, answers = gemini
    answers["*"] = GOOD
    r = gen(client, member, filters=["Pedas"], nonce=11)
    assert r["engine"] == "gemini" and [x["title"] for x in r["recipes"]] == [g["title"] for g in GOOD]
    assert all(x["source"] == "ai" and x["pay"] <= 15000 for x in r["recipes"])
    assert calls[0][0] == settings.gemini_models[0] and "Rp15000" in calls[0][1]
    detail = client.get(f"/api/recipes/{r['recipes'][0]['id']}").json()
    assert detail["art"] == 1 and {i["step"] for i in detail["ingredients"]} <= {0, 1}
    assert detail["cost"] == 2 * 1800 + 1500 + 1500 + 1500  # telur, sawi (0,5 x 3000), saus tiram, nasi


def test_bad_ai_recipes_are_dropped_and_topped_up(client, member, gemini):
    _, answers = gemini
    answers["*"] = [
        GOOD[0],
        recipe("Steak Wagyu", [("Daging wagyu", 1, 0)]),  # not in the price table
        recipe("Udang Seember", [("Udang kupas", 5, 0)]),  # Rp45.000, over budget
    ]
    r = gen(client, member, budget=12000, nonce=12)
    assert r["engine"] == "gemini" and len(r["recipes"]) == 3
    assert r["recipes"][0]["source"] == "ai" and r["recipes"][1]["source"] != "ai"
    assert all(x["pay"] <= 12000 for x in r["recipes"])


def test_model_out_of_quota_falls_through_to_next(client, member, gemini):
    calls, answers = gemini
    first, second = settings.gemini_models[:2]
    answers[first] = ai.ModelError("quota", "429 RESOURCE_EXHAUSTED")
    answers[second] = GOOD
    r = gen(client, member, budget=16000, nonce=13)
    assert r["engine"] == "gemini" and [m for m, _ in calls] == [first, second]
    assert first not in ai.models_to_try()  # skipped until the quota resets
    gen(client, member, budget=17000, nonce=14)
    assert calls[-1][0] == second


def test_all_models_failing_uses_rules(client, member, gemini):
    _, answers = gemini
    answers["*"] = ai.ModelError("other", "timeout")
    r = gen(client, member, budget=15500, nonce=15)
    assert r["engine"] == "rules" and len(r["recipes"]) == 3


def test_vegetarian_and_allergy_rules_are_enforced(client, member, gemini):
    _, answers = gemini
    answers["*"] = [recipe("Ayam Goreng", [("Ayam potong", 1, 0)]), GOOD[1], GOOD[2]]
    r = gen(client, member, budget=14000, filters=["Vegetarian"], nonce=16)
    assert "Ayam Goreng" not in [x["title"] for x in r["recipes"]]


def test_identical_requests_reuse_cached_batches(client, member, gemini):
    calls, answers = gemini
    answers["*"] = GOOD
    for n in range(ai.BATCHES_PER_KEY):
        gen(client, member, budget=18000, nonce=100 + n)
    used = len(calls)
    r = gen(client, member, budget=18000, nonce=200)
    assert len(calls) == used and r["engine"] == "gemini"  # served from cache, no quota spent
    assert "Jangan ulangi resep ini: Telur Sawi" in calls[1][1]  # later calls ask for different recipes


def test_free_plan_never_calls_ai(client, guest, gemini):
    calls, answers = gemini
    answers["*"] = GOOD
    r = gen(client, guest, nonce=17)
    assert r["engine"] == "rules" and calls == []


def test_custom_model_setting(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_MODEL", " gemini-x-flash , gemini-y ")
    assert settings.gemini_models == ["gemini-x-flash", "gemini-y"]
    monkeypatch.setattr(settings, "GEMINI_MODEL", "")
    assert len(settings.gemini_models) == 4


def test_health_reports_ai(client, gemini):
    h = client.get("/api/health").json()
    assert h["ai"] == "gemini" and h["ai_available"] == settings.gemini_models
