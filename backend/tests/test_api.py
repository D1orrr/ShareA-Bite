from app.seed import DEMO_EMAIL, DEMO_PASSWORD


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["database"] == "connected"


def test_register_login_and_duplicate(client):
    body = {"name": "Tes", "email": "tes@example.com", "password": "rahasia1"}
    assert client.post("/api/auth/register", json=body).status_code == 200
    assert client.post("/api/auth/register", json=body).status_code == 409
    assert client.post("/api/auth/login", json={"email": "tes@example.com", "password": "salah"}).status_code == 401
    r = client.post("/api/auth/login", json={"email": "tes@example.com", "password": "rahasia1"})
    assert r.status_code == 200 and r.json()["user"]["name"] == "Tes"


def test_requires_auth(client):
    assert client.get("/api/me").status_code == 401
    assert client.get("/api/me", headers={"Authorization": "Bearer nope"}).status_code == 401


def test_demo_user_seeded(client):
    r = client.post("/api/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    h = {"Authorization": f"Bearer {r.json()['token']}"}
    stats = client.get("/api/me/stats", headers=h).json()
    assert len(stats["history"]) == 6 and stats["saved_count"] == 1
    assert len(client.get("/api/cart", headers=h).json()) == 6


def test_generate_fits_budget(client, member):
    for budget in (8000, 10000, 15000, 25000):
        r = client.post("/api/recipes/generate", json={"budget": budget, "filters": [], "nonce": budget}, headers=member).json()
        assert len(r["recipes"]) == 3
        assert all(x["pay"] <= budget for x in r["recipes"]), (budget, r)


def test_generate_vegetarian_and_tools(client, member):
    from app.seed import INGREDIENTS

    meat = {n for n, v in INGREDIENTS.items() if "m" in v[6]}
    r = client.post("/api/recipes/generate", json={"budget": 20000, "filters": ["Vegetarian"]}, headers=member).json()
    names = [i["name"] for x in r["recipes"] for i in x["ingredients"]]
    assert not meat & set(names)
    r = client.post("/api/recipes/generate", json={"budget": 20000, "filters": ["Microwave"]}, headers=member).json()
    assert len(r["recipes"]) == 3 and all("Microwave" in x["tools"] for x in r["recipes"])


def test_generate_allergy(client, guest):
    client.put("/api/me", json={"allergies": "telur"}, headers=guest)
    r = client.post("/api/recipes/generate", json={"budget": 20000, "filters": []}, headers=guest).json()
    assert all("Telur" not in i["name"] for x in r["recipes"] for i in x["ingredients"])


def test_swap_makes_cheaper_variant(client, member):
    base = client.get("/api/recipes/1").json()
    egg = next(i for i in base["ingredients"] if i["swap"])
    v = client.post("/api/recipes/1/swap", json={"ingredient_id": egg["id"]}, headers=member).json()
    assert v["id"] != 1 and v["parent_id"] == 1 and v["cost"] < base["cost"]
    again = client.post("/api/recipes/1/swap", json={"ingredient_id": egg["id"]}, headers=member).json()
    assert again["id"] == v["id"]  # reused, not duplicated


def test_cart_merge_and_clear(client, guest):
    client.post("/api/cart/from-recipe/1", headers=guest)
    items = client.post("/api/cart/from-recipe/1", headers=guest).json()
    egg = next(i for i in items if i["name"] == "Telur ayam")
    assert egg["qty"] == 4 and len(items) == 6
    client.patch(f"/api/cart/{egg['id']}", json={"done": True}, headers=guest)
    assert len(client.delete("/api/cart", headers=guest).json()) == 5


def test_expense_updates_stats(client, guest):
    client.post("/api/expenses", json={"amount": 9000}, headers=guest)
    s = client.get("/api/me/stats", headers=guest).json()
    assert s["today_spent"] == 9000 and s["history"][-1]["amount"] == 9000


def test_posts_like_save_comment(client, guest):
    p = client.post("/api/posts", json={"type": "Resep", "title": "Tes Post", "cost": 5000}, headers=guest).json()
    assert p["mine"] and p["likes"] == 0
    assert client.post(f"/api/posts/{p['id']}/like", headers=guest).json()["likes"] == 1
    client.post(f"/api/posts/{p['id']}/save", headers=guest)
    saved = client.get("/api/posts?saved=true", headers=guest).json()
    assert [x["id"] for x in saved] == [p["id"]]
    c = client.post(f"/api/posts/{p['id']}/comments", json={"text": "Mantap"}, headers=guest).json()
    assert c[-1]["text"] == "Mantap"
    assert client.get("/api/posts?max_cost=10000", headers=guest).json()


def test_spots_filter(client):
    all_ = client.get("/api/spots").json()
    sayur = client.get("/api/spots?tags=Sayur").json()
    assert len(sayur) < len(all_) and all("Sayur" in s["tags"] for s in sayur)


# ---- data -----------------------------------------------------------------------

def test_seed_data_is_consistent(client):
    from app.seed import INGREDIENTS, RECIPES, SPOTS, SWAPS

    assert len(INGREDIENTS) >= 60 and len(RECIPES) == 40 and len(SPOTS) >= 10
    for name, (to, _) in SWAPS.items():
        assert name in INGREDIENTS and to in INGREDIENTS
    for title, _a, _c, _m, tools, _t, items, steps in RECIPES:
        assert tools and steps, title
        for ing, qty, step in items:
            assert ing in INGREDIENTS and qty > 0 and 0 <= step < len(steps), (title, ing)
    costs = [client.get(f"/api/recipes/{i}").json()["cost"] for i in range(1, 41)]
    assert min(costs) >= 2000 and max(costs) <= 25000, costs
    assert all("Alam Sutera" in s["city"] for s in client.get("/api/spots").json())


def test_every_recipe_step_has_its_ingredients(client):
    r = client.get("/api/recipes/24").json()  # Nasi Liwet Teri Rice Cooker
    assert {i["step"] for i in r["ingredients"]} <= set(range(len(r["steps"])))


# ---- plans ----------------------------------------------------------------------

def test_plans_listed(client):
    ps = client.get("/api/plans").json()
    assert [p["key"] for p in ps] == ["free", "canteen", "brunch", "gala"]
    assert [p["price"] for p in ps] == sorted(p["price"] for p in ps)


def test_free_generate_limit(client, guest):
    for _ in range(3):
        assert client.post("/api/recipes/generate", json={"budget": 15000}, headers=guest).status_code == 200
    r = client.post("/api/recipes/generate", json={"budget": 15000}, headers=guest)
    assert r.status_code == 429 and r.json()["detail"]["code"] == "limit"
    plan = client.get("/api/me/plan", headers=guest).json()
    assert plan["tier"] == "free" and plan["usage"]["generate"] == {"used": 3, "limit": 3, "left": 0}


def test_guest_cannot_buy_and_upgrade_lifts_limit(client):
    import uuid

    g = {"Authorization": "Bearer " + client.post("/api/auth/guest").json()["token"]}
    assert client.post("/api/me/plan", json={"tier": "brunch"}, headers=g).status_code == 403
    email = f"u{uuid.uuid4().hex[:8]}@example.com"
    h = {"Authorization": "Bearer " + client.post("/api/auth/register", json={"name": "U", "email": email, "password": "rahasia1"}).json()["token"]}
    for _ in range(3):
        client.post("/api/recipes/generate", json={"budget": 15000}, headers=h)
    assert client.post("/api/recipes/generate", json={"budget": 15000}, headers=h).status_code == 429
    p = client.post("/api/me/plan", json={"tier": "canteen"}, headers=h).json()
    assert p["tier"] == "canteen" and p["usage"]["generate"]["left"] == 7 and p["until"]
    assert client.post("/api/recipes/generate", json={"budget": 15000}, headers=h).status_code == 200


def test_free_saved_limit(client, guest):
    for i in range(1, 11):
        assert client.post(f"/api/saved/{i}", headers=guest).status_code == 200
    r = client.post("/api/saved/11", headers=guest)
    assert r.status_code == 429 and r.json()["detail"]["kind"] == "saved"


def test_expired_plan_falls_back_to_free(client):
    from datetime import datetime, timedelta, timezone

    from app import models, plans

    u = models.User(name="x", tier="gala", tier_until=datetime.now(timezone.utc) - timedelta(days=1))
    assert plans.tier_of(u) == "free"


def test_old_database_is_rebuilt():
    """A database seeded before SEED_VERSION existed gets wiped and re-seeded on startup."""
    from sqlalchemy import select

    from app import models
    from app.database import SessionLocal
    from app.main import init_db

    with SessionLocal() as db:
        db.delete(db.get(models.AppMeta, "seed_version"))
        db.query(models.Spot).update({"city": "Depok"})
        db.commit()
    init_db()
    with SessionLocal() as db:
        assert db.get(models.AppMeta, "seed_version")
        assert {s.city for s in db.scalars(select(models.Spot))} == {"Alam Sutera"}


def test_gala_demo_account(client):
    from app.seed import GALA_EMAIL, GALA_PASSWORD

    r = client.post("/api/auth/login", json={"email": GALA_EMAIL, "password": GALA_PASSWORD})
    assert r.status_code == 200 and r.json()["user"]["tier"] == "gala"
    h = {"Authorization": "Bearer " + r.json()["token"]}
    plan = client.get("/api/me/plan", headers=h).json()
    assert plan["plan"]["name"] == "Gala Dinner" and plan["usage"]["generate"]["limit"] is None
    assert plan["usage"]["saved"]["used"] == 4
