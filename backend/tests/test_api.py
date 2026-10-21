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


def test_generate_fits_budget(client, guest):
    for budget in (8000, 10000, 15000, 25000):
        r = client.post("/api/recipes/generate", json={"budget": budget, "filters": [], "nonce": budget}, headers=guest).json()
        assert len(r["recipes"]) == 3
        assert all(x["pay"] <= budget for x in r["recipes"]), (budget, r)


def test_generate_vegetarian_and_tools(client, guest):
    r = client.post("/api/recipes/generate", json={"budget": 20000, "filters": ["Vegetarian"]}, headers=guest).json()
    names = [i["name"] for x in r["recipes"] for i in x["ingredients"]]
    assert not {"Dada ayam", "Ikan kembung", "Sosis"} & set(names)
    r = client.post("/api/recipes/generate", json={"budget": 20000, "filters": ["Microwave"]}, headers=guest).json()
    assert all("Microwave" in x["tools"] for x in r["recipes"]) and r["note"]


def test_generate_allergy(client, guest):
    client.put("/api/me", json={"allergies": "telur"}, headers=guest)
    r = client.post("/api/recipes/generate", json={"budget": 20000, "filters": []}, headers=guest).json()
    assert all("Telur" not in i["name"] for x in r["recipes"] for i in x["ingredients"])


def test_swap_makes_cheaper_variant(client):
    base = client.get("/api/recipes/1").json()
    egg = next(i for i in base["ingredients"] if i["swap"])
    v = client.post("/api/recipes/1/swap", json={"ingredient_id": egg["id"]}).json()
    assert v["id"] != 1 and v["parent_id"] == 1 and v["cost"] < base["cost"]
    again = client.post("/api/recipes/1/swap", json={"ingredient_id": egg["id"]}).json()
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
