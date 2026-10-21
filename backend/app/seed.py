"""Demo data: ingredient price table, recipes, spots, community posts and a demo user.

Runs automatically on startup when the database is empty, so a fresh clone works
without any manual setup. Delete `share_a_bite.db` to reset everything.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models
from app.security import hash_password

# name: (unit, Rp/unit, category, kcal, protein, carbs, flags)
# flags: m = meat, p = pantry staple, s = spicy
INGREDIENTS: dict[str, tuple] = {
    "Nasi putih": ("porsi", 3000, "Karbo", 200, 4, 45, "p"),
    "Indomie": ("bks", 3500, "Karbo", 380, 8, 54, ""),
    "Roti tawar": ("lbr", 600, "Karbo", 70, 2.5, 13, ""),
    "Kentang": ("bh", 2000, "Karbo", 110, 3, 25, ""),
    "Telur ayam": ("btr", 2000, "Protein", 72, 6.3, 0.4, ""),
    "Tahu": ("pcs", 1000, "Protein", 40, 4.5, 1, ""),
    "Tempe": ("papan", 4000, "Protein", 390, 38, 18, ""),
    "Dada ayam": ("ons", 4500, "Protein", 165, 31, 0, "m"),
    "Ikan kembung": ("ekor", 6000, "Protein", 170, 22, 0, "m"),
    "Sosis": ("bh", 1500, "Protein", 90, 3, 3, "m"),
    "Kangkung": ("ikat", 3000, "Sayuran", 30, 3, 5, ""),
    "Sawi hijau": ("ikat", 2500, "Sayuran", 25, 2.5, 4, ""),
    "Tauge": ("bks", 2000, "Sayuran", 30, 3, 6, ""),
    "Bayam": ("ikat", 3000, "Sayuran", 23, 3, 4, ""),
    "Kol": ("ons", 1000, "Sayuran", 25, 1.3, 6, ""),
    "Wortel": ("bh", 1500, "Sayuran", 25, 0.6, 6, ""),
    "Tomat": ("bh", 1000, "Sayuran", 20, 1, 4, ""),
    "Labu siam": ("bh", 2000, "Sayuran", 30, 1, 7, ""),
    "Daun bawang": ("btg", 500, "Sayuran", 5, 0.3, 1, ""),
    "Kecap manis": ("sdm", 500, "Bumbu", 20, 0.5, 5, "p"),
    "Saus tiram": ("sachet", 1500, "Bumbu", 10, 0.3, 2, ""),
    "Sambal sachet": ("sachet", 500, "Bumbu", 10, 0.2, 2, "s"),
    "Cabai rawit": ("bh", 160, "Bumbu", 1, 0, 0.2, "s"),
    "Bawang merah": ("siung", 350, "Bumbu", 4, 0.1, 1, ""),
    "Bawang putih": ("siung", 300, "Bumbu", 4, 0.2, 1, ""),
    "Minyak goreng": ("sdm", 250, "Bumbu", 120, 0, 0, "p"),
    "Garam": ("sdt", 50, "Bumbu", 0, 0, 0, "p"),
    "Kaldu bubuk": ("sachet", 500, "Bumbu", 5, 0.3, 1, ""),
    "Santan instan": ("sachet", 3000, "Bumbu", 150, 1.5, 3, ""),
}

# ingredient -> (cheaper ingredient, qty ratio)
SWAPS = {
    "Telur ayam": ("Tahu", 1),
    "Tempe": ("Tahu", 2),
    "Dada ayam": ("Tempe", 0.5),
    "Ikan kembung": ("Telur ayam", 2),
    "Sosis": ("Tahu", 1),
    "Bayam": ("Kangkung", 0.5),
    "Saus tiram": ("Kecap manis", 1),
}

# title, art, color, minutes, tools, tip, [(ingredient, qty, step_idx)], [(step text, seconds)]
RECIPES = [
    (
        "Nasi Telur Kecap Cabai Rawit", 1, "#F4B82E", 15, ["Kompor"],
        "Api kecil biar telurnya nggak gosong.",
        [("Nasi putih", 1, 2), ("Telur ayam", 2, 1), ("Kecap manis", 1, 2), ("Cabai rawit", 5, 0), ("Bawang merah", 2, 0), ("Minyak goreng", 2, 0)],
        [("Panaskan minyak, tumis bawang merah dan cabai sampai harum.", 60), ("Kocok telur, tuang, orak-arik sampai set.", 90), ("Tambah kecap, aduk rata, sajikan di atas nasi hangat.", 0)],
    ),
    (
        "Tumis Kangkung Tempe Orek", 2, "#7FBF8F", 20, ["Kompor"],
        "Kangkung masuk paling akhir biar tetap hijau.",
        [("Nasi putih", 1, 2), ("Kangkung", 1, 2), ("Tempe", 1, 0), ("Bawang putih", 2, 1), ("Cabai rawit", 5, 1), ("Kecap manis", 2, 1)],
        [("Potong tempe dadu kecil, goreng sampai garing.", 180), ("Tumis bawang putih dan cabai, masukkan tempe plus kecap.", 60), ("Masukkan kangkung, aduk 1 menit lalu angkat.", 60)],
    ),
    (
        "Indomie Rebus Sayur Telur", 3, "#F2A27E", 12, ["Kompor", "Rice cooker"],
        "Telur dimasukkan pas air mendidih, jangan diaduk dulu.",
        [("Indomie", 1, 1), ("Telur ayam", 1, 1), ("Sawi hijau", 1, 2), ("Bawang merah", 2, 0), ("Cabai rawit", 3, 2), ("Kecap manis", 1, 2)],
        [("Rebus air 400 ml dengan bawang merah iris.", 120), ("Masukkan mie dan telur, masak sampai matang.", 180), ("Tambah sawi dan bumbu, aduk 30 detik, sajikan.", 30)],
    ),
    (
        "Tahu Tempe Bacem Rice Cooker", 2, "#C98B4E", 30, ["Rice cooker", "Kompor"],
        "Makin lama didiamkan di mode warm, bumbunya makin meresap.",
        [("Tahu", 2, 0), ("Tempe", 1, 0), ("Kecap manis", 2, 1), ("Bawang putih", 2, 1), ("Garam", 1, 1), ("Nasi putih", 1, 2)],
        [("Potong tahu dan tempe, masukkan ke rice cooker.", 0), ("Tambah kecap, bawang putih geprek, garam dan 200 ml air. Masak mode cook.", 900), ("Biarkan di mode warm 10 menit, sajikan dengan nasi.", 600)],
    ),
    (
        "Telur Dadar Wortel Daun Bawang", 1, "#F4D35E", 12, ["Kompor"],
        "Parut wortel halus biar matang bareng telurnya.",
        [("Telur ayam", 2, 0), ("Wortel", 1, 0), ("Daun bawang", 1, 0), ("Garam", 1, 0), ("Minyak goreng", 2, 1), ("Nasi putih", 1, 2)],
        [("Kocok telur dengan wortel parut, daun bawang dan garam.", 60), ("Goreng di minyak panas, balik sekali sampai kecokelatan.", 180), ("Potong-potong, sajikan dengan nasi hangat.", 0)],
    ),
    (
        "Sup Sayur Tahu Kuah Bening", 3, "#E8A87C", 20, ["Kompor", "Rice cooker"],
        "Masukkan sayur keras (wortel) dulu, kol belakangan.",
        [("Wortel", 1, 0), ("Kol", 1, 1), ("Tahu", 2, 1), ("Bawang putih", 2, 0), ("Kaldu bubuk", 1, 1), ("Nasi putih", 1, 2)],
        [("Rebus 500 ml air dengan bawang putih geprek dan wortel.", 300), ("Masukkan tahu, kol dan kaldu bubuk, masak sampai kol layu.", 180), ("Sajikan hangat bersama nasi.", 0)],
    ),
    (
        "Ayam Kecap Pedas Manis", 1, "#B5532F", 25, ["Kompor"],
        "Ayam dipotong kecil supaya cepat matang dan hemat gas.",
        [("Dada ayam", 1, 0), ("Kecap manis", 2, 1), ("Cabai rawit", 6, 1), ("Bawang merah", 3, 1), ("Minyak goreng", 2, 0), ("Nasi putih", 1, 2)],
        [("Potong dadu ayam, tumis sampai berubah warna.", 300), ("Masukkan bawang merah, cabai dan kecap, masak sampai mengental.", 240), ("Sajikan di atas nasi.", 0)],
    ),
    (
        "Tumis Tauge Tahu Saus Tiram", 2, "#A8C686", 10, ["Kompor", "Rice cooker"],
        "Tauge cukup 1 menit di api besar biar tetap renyah.",
        [("Tahu", 2, 0), ("Tauge", 1, 1), ("Saus tiram", 1, 1), ("Bawang putih", 2, 0), ("Minyak goreng", 1, 0), ("Nasi putih", 1, 2)],
        [("Goreng sebentar tahu potong dadu bersama bawang putih.", 120), ("Masukkan tauge dan saus tiram, aduk cepat.", 60), ("Angkat dan sajikan dengan nasi.", 0)],
    ),
    (
        "Mie Goreng Telur Sawi", 3, "#E9B955", 10, ["Kompor"],
        "Tiriskan mie sebelum dicampur bumbu supaya nggak lembek.",
        [("Indomie", 1, 0), ("Telur ayam", 1, 1), ("Sawi hijau", 1, 1), ("Cabai rawit", 3, 1)],
        [("Rebus mie 3 menit, tiriskan.", 180), ("Orak-arik telur, masukkan sawi dan cabai.", 90), ("Campur mie dengan bumbu dan tumisan, aduk rata.", 30)],
    ),
    (
        "Nasi Goreng Kampung", 1, "#D9822B", 15, ["Kompor"],
        "Pakai nasi sisa semalam, hasilnya lebih pera dan nggak lengket.",
        [("Nasi putih", 1, 1), ("Telur ayam", 1, 1), ("Bawang merah", 3, 0), ("Bawang putih", 2, 0), ("Cabai rawit", 4, 0), ("Kecap manis", 1, 1), ("Minyak goreng", 2, 0)],
        [("Tumis bawang merah, bawang putih dan cabai sampai harum.", 90), ("Masukkan telur, orak-arik, lalu nasi dan kecap.", 180), ("Aduk rata di api besar 1 menit, sajikan.", 60)],
    ),
    (
        "Bayam Bening + Tempe Goreng", 2, "#6FA86B", 20, ["Kompor"],
        "Bayam jangan dipanaskan ulang, habiskan sekali makan.",
        [("Bayam", 1, 1), ("Tempe", 1, 0), ("Bawang merah", 2, 1), ("Garam", 1, 1), ("Minyak goreng", 3, 0), ("Nasi putih", 1, 2)],
        [("Goreng tempe iris tipis sampai kering.", 240), ("Rebus air dengan bawang merah, masukkan bayam dan garam 1 menit.", 180), ("Sajikan sayur bening, tempe dan nasi.", 0)],
    ),
    (
        "Roti Telur Sosis Microwave", 1, "#F2C14E", 5, ["Microwave"],
        "Tusuk kuning telur dengan garpu supaya nggak meletus di microwave.",
        [("Roti tawar", 2, 0), ("Telur ayam", 2, 0), ("Sosis", 1, 0), ("Garam", 1, 0)],
        [("Kocok telur dan garam di mug, masukkan sosis iris.", 0), ("Microwave 60 detik, aduk, lalu 30 detik lagi.", 90), ("Jepit telur sosis di roti tawar.", 0)],
    ),
    (
        "Ikan Kembung Goreng Sambal", 2, "#8FA9B8", 25, ["Kompor"],
        "Lumuri garam dan diamkan 10 menit biar nggak amis.",
        [("Ikan kembung", 1, 0), ("Garam", 1, 0), ("Minyak goreng", 4, 1), ("Tomat", 1, 2), ("Sambal sachet", 2, 2), ("Nasi putih", 1, 2)],
        [("Lumuri ikan dengan garam, diamkan sebentar.", 600), ("Goreng ikan sampai kering kedua sisi.", 480), ("Sajikan dengan sambal, irisan tomat dan nasi.", 0)],
    ),
    (
        "Kentang Balado Pedas", 1, "#C8352B", 25, ["Kompor"],
        "Goreng kentang sampai kulit luarnya kering supaya baladonya menempel.",
        [("Kentang", 2, 0), ("Cabai rawit", 8, 1), ("Bawang merah", 3, 1), ("Tomat", 1, 1), ("Minyak goreng", 3, 0), ("Nasi putih", 1, 2)],
        [("Potong dadu kentang, goreng sampai matang.", 480), ("Tumis cabai, bawang merah dan tomat yang diulek kasar.", 180), ("Masukkan kentang, aduk rata, sajikan dengan nasi.", 60)],
    ),
    (
        "Sayur Lodeh Labu Siam", 3, "#E8C07D", 25, ["Kompor", "Rice cooker"],
        "Aduk santan terus supaya nggak pecah.",
        [("Labu siam", 1, 0), ("Santan instan", 1, 1), ("Tempe", 0.5, 0), ("Bawang merah", 2, 0), ("Cabai rawit", 3, 0), ("Nasi putih", 1, 2)],
        [("Rebus 400 ml air dengan bawang merah, cabai, labu dan tempe.", 480), ("Masukkan santan, aduk pelan sampai mendidih.", 240), ("Sajikan dengan nasi hangat.", 0)],
    ),
]

SPOTS = [
    ("Warung Bu Tini", "250 m", "06:00", "21:00", 9000, 4.7, ["Nasi", "Protein"]),
    ("Pasar Pagi Margonda", "600 m", "05:00", "11:00", 7500, 4.5, ["Sayur", "Protein"]),
    ("Tahu Tempe Pak Yanto", "900 m", "07:00", "17:00", 5000, 4.8, ["Protein"]),
    ("Lapak Sayur Mbak Wati", "1,1 km", "06:00", "15:00", 4000, 4.6, ["Sayur"]),
    ("Warteg Bahari Kober", "350 m", "07:00", "23:00", 10000, 4.4, ["Nasi", "Sayur", "Protein"]),
]

DEMO_EMAIL = "dinda@sharebite.id"
DEMO_PASSWORD = "hemat123"


def ing_map(db: Session) -> dict[str, models.Ingredient]:
    return {i.name: i for i in db.scalars(select(models.Ingredient))}


def seed(db: Session) -> None:
    if db.scalar(select(models.Ingredient.id).limit(1)):
        return  # already seeded

    # Price table
    for name, (unit, price, cat, kcal, prot, carbs, flags) in INGREDIENTS.items():
        db.add(
            models.Ingredient(
                name=name, unit=unit, price_per_unit=price, category=cat, kcal=kcal, protein=prot, carbs=carbs,
                is_meat="m" in flags, is_pantry="p" in flags, is_spicy="s" in flags,
            )
        )
    db.flush()
    ing = ing_map(db)
    for name, (to, ratio) in SWAPS.items():
        ing[name].swap_to_id = ing[to].id
        ing[name].swap_ratio = ratio

    # Recipes
    for title, art, color, minutes, tools, tip, items, steps in RECIPES:
        r = models.Recipe(title=title, art=art, color=color, minutes=minutes, tools=tools, tip=tip, source="seed")
        r.items = [models.RecipeIngredient(ingredient_id=ing[n].id, qty=q, step_idx=s) for n, q, s in items]
        r.steps = [models.RecipeStep(idx=i, text=t, seconds=sec) for i, (t, sec) in enumerate(steps)]
        db.add(r)

    # Spots
    for name, dist, f, t, price, rating, tags in SPOTS:
        db.add(models.Spot(name=name, distance=dist, open_from=f, open_to=t, price=price, rating=rating, tags=tags))
    db.flush()

    # Demo user with some history
    now = datetime.now(timezone.utc)
    demo = models.User(
        email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD), name="Dinda Aprilia",
        campus="Universitas Indonesia, Depok", daily_budget=15000, shop_budget=35000,
        prefs=["Halal", "Pedas", "Rice cooker", "Kompor"],
    )
    db.add(demo)
    db.flush()
    for days_ago, amount in zip(range(6, 0, -1), [12500, 9500, 14000, 8800, 11000, 7500]):
        db.add(models.Expense(user_id=demo.id, amount=amount, budget=15000, created_at=now - timedelta(days=days_ago)))
    db.add(models.SavedRecipe(user_id=demo.id, recipe_id=1))
    for name, qty, unit, price, cat, done in [
        ("Kangkung", 1, "ikat", 3000, "Sayuran", True), ("Telur ayam", 6, "btr", 12000, "Protein", False),
        ("Tempe", 1, "papan", 5000, "Protein", False), ("Bawang merah", 1, "ons", 1700, "Bumbu", True),
        ("Cabai rawit", 50, "g", 1000, "Bumbu", False), ("Indomie", 5, "bks", 5000, "Karbo", False),
    ]:
        db.add(models.CartItem(user_id=demo.id, name=name, qty=qty, unit=unit, price=price, category=cat, done=done))

    # Community posts
    posts = [
        models.Post(
            author_name="Rina", campus="UI Depok", type="Resep", recipe_id=2, cost=7000,
            title="Mendoan Renyah Sambal Kecap Cuma Rp7.000!",
            body="Beli tempe papan di Pasar Kober cuma Rp4.000, tepung bumbu sachet Rp2.500, daun bawang minta bonus pedagang. Goreng dadakan langsung gurih mantap!",
            base_likes=142, created_at=now - timedelta(hours=2),
        ),
        models.Post(
            author_name="Budi", campus="Kukusan", type="Info Warung",
            title="Tips belanja telur eceran di Warung Madura Jl. Kober hemat Rp3rb/kg",
            body="Kalau beli setelah jam 4 sore sering ada harga pas Rp27.000/kg dan boleh pilih telur yang fresh. Cocok buat stok lauk seminggu anak kosan.",
            location="Warung Madura Berkah, Jl. Kober No. 14", base_likes=89, created_at=now - timedelta(hours=5),
        ),
        models.Post(
            author_name="Dimas", campus="Pocin", type="Trik Masak", recipe_id=8, cost=5500,
            title="Tumis Toge Tahu Saus Tiram: Modal Rp5.500 Buat Sarapan",
            body="Tahu kuning 2 biji (Rp2.000) goreng sebentar, toge seplastik kecil (Rp2.000), sachet saus tiram mini (Rp1.500). Masak 5 menit di rice cooker pun jadi!",
            cook_time="5 - 7 Menit", per_portion="Rp2.750 / org", base_likes=204, created_at=now - timedelta(days=1),
        ),
    ]
    db.add_all(posts)
    db.flush()
    for post, who, text in [
        (posts[0], "Sari", "Wah aku coba besok, makasih tipsnya!"),
        (posts[0], "Andre", "Tepung bumbunya merk apa kak?"),
        (posts[1], "Lala", "Valid, aku juga sering beli sore di situ."),
        (posts[2], "Rina", "Saus tiram mini emang penyelamat akhir bulan 😂"),
    ]:
        db.add(models.Comment(post_id=post.id, author_name=who, text=text))

    db.commit()
