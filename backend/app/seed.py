"""Demo data: ingredient price table, recipes, cheap spots, community posts and a demo user.

Runs automatically on startup when the database is empty, so a fresh clone works
without any manual setup. Bump `SEED_VERSION` to rebuild a database that was created
with older data (main.py drops and re-creates the tables when the version changes).

Prices are retail prices for one student buying small amounts around BINUS @Alam Sutera,
Tangerang Selatan (Nov 2026). Anchors: PAGAR Tangsel city price monitor (telur, tahu,
tempe, bawang merah, kol), PIHPS national monitor (cabai, bawang putih) and Indomaret /
Alfamart shelf prices (Indomie, kecap, minyak). Everything else is an estimate of the
eceran price at a warung or tukang sayur and should be checked by the team.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models
from app.security import hash_password

SEED_VERSION = 2

# name: (unit, Rp/unit, category, kcal, protein g, carbs g, flags)
# Nutrition is per unit. flags: m = meat/fish (not vegetarian), p = pantry staple most
# students already have at the kos, s = spicy.
INGREDIENTS: dict[str, tuple] = {
    # --- Karbo ---------------------------------------------------------------
    "Nasi putih": ("porsi", 1500, "Karbo", 200, 4, 44, "p"),  # ±80 g beras @ Rp15rb/kg
    "Indomie": ("bks", 3200, "Karbo", 380, 8, 54, ""),
    "Mie telur": ("keping", 1500, "Karbo", 220, 7, 43, ""),
    "Bihun": ("keping", 1200, "Karbo", 145, 0.2, 35, ""),
    "Roti tawar": ("lbr", 600, "Karbo", 70, 2.5, 13, ""),
    "Kentang": ("bh", 2500, "Karbo", 115, 3, 26, ""),  # ±150 g
    "Ubi jalar": ("bh", 2000, "Karbo", 170, 3, 40, ""),  # ±200 g
    "Oatmeal": ("sdm", 500, "Karbo", 38, 1.3, 6.6, ""),  # 10 g
    "Tepung terigu": ("sdm", 150, "Karbo", 36, 1, 7.6, ""),  # 10 g
    "Tepung bumbu": ("sachet", 2500, "Karbo", 280, 6, 60, ""),  # 80 g
    "Kerupuk": ("bks", 1000, "Karbo", 60, 0.5, 9, ""),
    # --- Protein -------------------------------------------------------------
    "Telur ayam": ("btr", 1800, "Protein", 72, 6.3, 0.4, ""),  # Rp25,5rb/kg + eceran
    "Tahu": ("pcs", 700, "Protein", 46, 5, 1.1, ""),  # ±60 g
    "Tempe": ("papan", 4000, "Protein", 390, 38, 18, ""),  # ±200 g
    "Dada ayam": ("ons", 5500, "Protein", 165, 31, 0, "m"),
    "Ayam potong": ("potong", 6000, "Protein", 210, 18, 0, "m"),
    "Ati ampela": ("pasang", 3500, "Protein", 80, 12, 1, "m"),
    "Ikan kembung": ("ekor", 6000, "Protein", 170, 22, 0, "m"),
    "Ikan lele": ("ekor", 5000, "Protein", 160, 25, 0, "m"),
    "Teri nasi": ("sdm", 1200, "Protein", 33, 6.8, 0, "m"),  # 10 g
    "Udang kupas": ("ons", 9000, "Protein", 99, 24, 0, "m"),
    "Sosis": ("bh", 1500, "Protein", 60, 2.7, 2, "m"),
    "Bakso sapi": ("btr", 1200, "Protein", 30, 2, 2, "m"),
    "Kacang tanah": ("sdm", 300, "Protein", 57, 2.6, 1.6, ""),  # 10 g
    "Keju lembaran": ("lbr", 2500, "Protein", 60, 3.5, 1, ""),
    # --- Sayuran -------------------------------------------------------------
    "Kangkung": ("ikat", 2500, "Sayuran", 40, 5, 7, ""),
    "Sawi hijau": ("ikat", 3000, "Sayuran", 40, 4, 6, ""),
    "Bayam": ("ikat", 3500, "Sayuran", 46, 5.7, 7, ""),
    "Pakcoy": ("ikat", 4000, "Sayuran", 26, 3, 4.4, ""),
    "Sawi putih": ("ons", 1500, "Sayuran", 13, 1.5, 2.2, ""),
    "Tauge": ("bks", 2000, "Sayuran", 45, 4.5, 9, ""),
    "Kol": ("ons", 1300, "Sayuran", 25, 1.3, 6, ""),  # Rp12,9rb/kg
    "Wortel": ("bh", 1500, "Sayuran", 41, 0.9, 10, ""),
    "Tomat": ("bh", 1200, "Sayuran", 18, 0.9, 3.9, ""),
    "Timun": ("bh", 1500, "Sayuran", 23, 1, 5, ""),
    "Labu siam": ("bh", 2500, "Sayuran", 48, 2, 11, ""),
    "Buncis": ("ons", 2000, "Sayuran", 31, 1.8, 7, ""),
    "Kacang panjang": ("ikat", 3000, "Sayuran", 70, 4, 12, ""),
    "Terong ungu": ("bh", 3000, "Sayuran", 50, 2, 12, ""),
    "Brokoli": ("ons", 4000, "Sayuran", 34, 2.8, 7, ""),
    "Jamur tiram": ("ons", 3000, "Sayuran", 33, 3.3, 6, ""),
    "Jagung manis": ("bh", 3000, "Sayuran", 90, 3, 19, ""),
    "Daun bawang": ("btg", 500, "Sayuran", 5, 0.3, 1, ""),
    "Seledri": ("ikat", 1000, "Sayuran", 3, 0.2, 0.6, ""),
    # --- Bumbu ---------------------------------------------------------------
    "Bawang merah": ("siung", 200, "Bumbu", 4, 0.1, 1, ""),  # ±5 g @ Rp38,8rb/kg
    "Bawang putih": ("siung", 200, "Bumbu", 4, 0.2, 1, ""),
    "Bawang bombay": ("bh", 3500, "Bumbu", 40, 1.1, 9, ""),
    "Cabai rawit": ("bh", 150, "Bumbu", 1, 0, 0.2, "s"),  # ±1,5 g @ Rp96rb/kg
    "Cabai merah keriting": ("bh", 400, "Bumbu", 2, 0.1, 0.4, "s"),
    "Kecap manis": ("sdm", 500, "Bumbu", 20, 0.5, 5, "p"),
    "Kecap asin": ("sdm", 300, "Bumbu", 10, 1, 1, ""),
    "Saus tiram": ("sachet", 1500, "Bumbu", 20, 0.3, 4, ""),
    "Saus sambal": ("sachet", 500, "Bumbu", 10, 0.2, 2, "s"),
    "Saus tomat": ("sachet", 500, "Bumbu", 10, 0.2, 2, ""),
    "Minyak goreng": ("sdm", 300, "Bumbu", 120, 0, 0, "p"),  # Rp40,5rb / 2 L
    "Margarin": ("sdm", 400, "Bumbu", 100, 0, 0, ""),
    "Garam": ("sdt", 50, "Bumbu", 0, 0, 0, "p"),
    "Gula pasir": ("sdt", 80, "Bumbu", 16, 0, 4, "p"),
    "Gula merah": ("sdm", 300, "Bumbu", 38, 0, 9.5, ""),
    "Lada bubuk": ("sachet", 1000, "Bumbu", 10, 0.4, 2.6, ""),
    "Kaldu bubuk": ("sachet", 500, "Bumbu", 5, 0.3, 1, ""),
    "Santan instan": ("sachet", 3000, "Bumbu", 150, 1.5, 3, ""),
    "Jeruk nipis": ("bh", 700, "Bumbu", 10, 0.2, 3, ""),
    "Daun salam & lengkuas": ("paket", 1000, "Bumbu", 2, 0, 0.4, ""),
}

# ingredient -> (cheaper ingredient, qty ratio)
SWAPS = {
    "Telur ayam": ("Tahu", 1),
    "Tempe": ("Tahu", 2),
    "Dada ayam": ("Tempe", 0.5),
    "Ayam potong": ("Telur ayam", 2),
    "Ati ampela": ("Telur ayam", 1),
    "Ikan kembung": ("Telur ayam", 2),
    "Ikan lele": ("Telur ayam", 2),
    "Udang kupas": ("Tempe", 0.5),
    "Sosis": ("Tahu", 1),
    "Bakso sapi": ("Tahu", 0.5),
    "Keju lembaran": ("Telur ayam", 0.5),
    "Bayam": ("Kangkung", 1),
    "Pakcoy": ("Sawi hijau", 1),
    "Brokoli": ("Kol", 1),
    "Jamur tiram": ("Tauge", 1),
    "Saus tiram": ("Kecap manis", 1),
    "Bawang bombay": ("Bawang merah", 3),
    "Cabai merah keriting": ("Cabai rawit", 2),
    "Margarin": ("Minyak goreng", 1),
}

# title, art, color, minutes, tools, tip, [(ingredient, qty, first step that uses it)], [(step text, seconds)]
# art: 1 = rice/egg plate, 2 = side-dish plate, 3 = noodle/soup bowl
RECIPES = [
    # 1-15: the original demo recipes (ids 1, 2 and 8 are referenced by the demo user and posts)
    (
        "Nasi Telur Kecap Cabai Rawit", 1, "#F4B82E", 15, ["Kompor"],
        "Api kecil biar telurnya nggak gosong.",
        [("Bawang merah", 2, 0), ("Cabai rawit", 5, 0), ("Minyak goreng", 2, 0), ("Telur ayam", 2, 1), ("Kecap manis", 1, 2), ("Nasi putih", 1, 2)],
        [("Panaskan minyak, tumis bawang merah dan cabai sampai harum.", 60), ("Kocok telur, tuang, orak-arik sampai set.", 90), ("Tambah kecap, aduk rata, sajikan di atas nasi hangat.", 0)],
    ),
    (
        "Tumis Kangkung Tempe Orek", 2, "#7FBF8F", 20, ["Kompor"],
        "Kangkung masuk paling akhir biar tetap hijau.",
        [("Tempe", 1, 0), ("Minyak goreng", 2, 0), ("Bawang putih", 2, 1), ("Cabai rawit", 5, 1), ("Kecap manis", 2, 1), ("Kangkung", 1, 2), ("Nasi putih", 1, 2)],
        [("Potong tempe dadu kecil, goreng sampai garing.", 180), ("Tumis bawang putih dan cabai, masukkan tempe dan kecap.", 60), ("Masukkan kangkung, aduk 1 menit lalu angkat.", 60)],
    ),
    (
        "Indomie Rebus Sayur Telur", 3, "#F2A27E", 12, ["Kompor", "Rice cooker"],
        "Telur dimasukkan pas air mendidih, jangan diaduk dulu.",
        [("Bawang merah", 2, 0), ("Indomie", 1, 1), ("Telur ayam", 1, 1), ("Sawi hijau", 0.5, 2), ("Cabai rawit", 3, 2)],
        [("Rebus 400 ml air dengan bawang merah iris.", 120), ("Masukkan mie dan telur, masak sampai matang.", 180), ("Tambah sawi, cabai dan bumbu mie, aduk 30 detik, sajikan.", 30)],
    ),
    (
        "Tahu Tempe Bacem Rice Cooker", 2, "#C98B4E", 30, ["Rice cooker", "Kompor"],
        "Makin lama didiamkan di mode warm, bumbunya makin meresap.",
        [("Tahu", 2, 0), ("Tempe", 1, 0), ("Kecap manis", 2, 1), ("Gula merah", 1, 1), ("Bawang putih", 2, 1), ("Daun salam & lengkuas", 1, 1), ("Garam", 1, 1), ("Nasi putih", 1, 2)],
        [("Potong tahu dan tempe, masukkan ke rice cooker.", 0), ("Tambah kecap, gula merah, bawang putih geprek, salam, lengkuas, garam dan 200 ml air. Masak mode cook.", 900), ("Biarkan di mode warm 10 menit, sajikan dengan nasi.", 600)],
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
        [("Wortel", 1, 0), ("Bawang putih", 2, 0), ("Kol", 1, 1), ("Tahu", 2, 1), ("Kaldu bubuk", 1, 1), ("Nasi putih", 1, 2)],
        [("Rebus 500 ml air dengan bawang putih geprek dan wortel.", 300), ("Masukkan tahu, kol dan kaldu bubuk, masak sampai kol layu.", 180), ("Sajikan hangat bersama nasi.", 0)],
    ),
    (
        "Ayam Kecap Pedas Manis", 1, "#B5532F", 25, ["Kompor"],
        "Ayam dipotong kecil supaya cepat matang dan hemat gas.",
        [("Dada ayam", 1, 0), ("Minyak goreng", 2, 0), ("Kecap manis", 2, 1), ("Cabai rawit", 6, 1), ("Bawang merah", 3, 1), ("Nasi putih", 1, 2)],
        [("Potong dadu ayam, tumis sampai berubah warna.", 300), ("Masukkan bawang merah, cabai dan kecap, masak sampai mengental.", 240), ("Sajikan di atas nasi.", 0)],
    ),
    (
        "Tumis Tauge Tahu Saus Tiram", 2, "#A8C686", 10, ["Kompor", "Rice cooker"],
        "Tauge cukup 1 menit di api besar biar tetap renyah.",
        [("Tahu", 2, 0), ("Bawang putih", 2, 0), ("Minyak goreng", 1, 0), ("Tauge", 1, 1), ("Saus tiram", 1, 1), ("Nasi putih", 1, 2)],
        [("Goreng sebentar tahu potong dadu bersama bawang putih.", 120), ("Masukkan tauge dan saus tiram, aduk cepat.", 60), ("Angkat dan sajikan dengan nasi.", 0)],
    ),
    (
        "Mie Goreng Telur Sawi", 3, "#E9B955", 10, ["Kompor"],
        "Tiriskan mie sebelum dicampur bumbu supaya nggak lembek.",
        [("Indomie", 1, 0), ("Telur ayam", 1, 1), ("Sawi hijau", 0.5, 1), ("Cabai rawit", 3, 1), ("Minyak goreng", 1, 1)],
        [("Rebus mie 3 menit, tiriskan.", 180), ("Orak-arik telur, masukkan sawi dan cabai.", 90), ("Campur mie dengan bumbu dan tumisan, aduk rata.", 30)],
    ),
    (
        "Nasi Goreng Kampung", 1, "#D9822B", 15, ["Kompor"],
        "Pakai nasi sisa semalam, hasilnya lebih pera dan nggak lengket.",
        [("Bawang merah", 3, 0), ("Bawang putih", 2, 0), ("Cabai rawit", 4, 0), ("Minyak goreng", 2, 0), ("Nasi putih", 1, 1), ("Telur ayam", 1, 1), ("Kecap manis", 1, 1)],
        [("Tumis bawang merah, bawang putih dan cabai sampai harum.", 90), ("Masukkan telur, orak-arik, lalu nasi dan kecap.", 180), ("Aduk rata di api besar 1 menit, sajikan.", 60)],
    ),
    (
        "Bayam Bening + Tempe Goreng", 2, "#6FA86B", 20, ["Kompor"],
        "Bayam jangan dipanaskan ulang, habiskan sekali makan.",
        [("Tempe", 1, 0), ("Minyak goreng", 3, 0), ("Bayam", 1, 1), ("Bawang merah", 2, 1), ("Garam", 1, 1), ("Nasi putih", 1, 2)],
        [("Goreng tempe iris tipis sampai kering.", 240), ("Rebus air dengan bawang merah, masukkan bayam dan garam 1 menit.", 180), ("Sajikan sayur bening, tempe dan nasi.", 0)],
    ),
    (
        "Roti Telur Sosis Microwave", 1, "#F2C14E", 5, ["Microwave"],
        "Tusuk kuning telur dengan garpu supaya nggak meletus di microwave.",
        [("Telur ayam", 2, 0), ("Sosis", 1, 0), ("Garam", 1, 0), ("Roti tawar", 2, 2)],
        [("Kocok telur dan garam di mug, masukkan sosis iris.", 0), ("Microwave 60 detik, aduk, lalu 30 detik lagi.", 90), ("Jepit telur sosis di roti tawar.", 0)],
    ),
    (
        "Ikan Kembung Goreng Sambal", 2, "#8FA9B8", 25, ["Kompor"],
        "Lumuri garam dan diamkan 10 menit biar nggak amis.",
        [("Ikan kembung", 1, 0), ("Garam", 1, 0), ("Minyak goreng", 4, 1), ("Tomat", 1, 2), ("Saus sambal", 2, 2), ("Nasi putih", 1, 2)],
        [("Lumuri ikan dengan garam, diamkan sebentar.", 600), ("Goreng ikan sampai kering kedua sisi.", 480), ("Sajikan dengan sambal, irisan tomat dan nasi.", 0)],
    ),
    (
        "Kentang Balado Pedas", 1, "#C8352B", 25, ["Kompor"],
        "Goreng kentang sampai kulit luarnya kering supaya baladonya menempel.",
        [("Kentang", 2, 0), ("Minyak goreng", 3, 0), ("Cabai rawit", 8, 1), ("Bawang merah", 3, 1), ("Tomat", 1, 1), ("Nasi putih", 1, 2)],
        [("Potong dadu kentang, goreng sampai matang.", 480), ("Tumis cabai, bawang merah dan tomat yang diulek kasar.", 180), ("Masukkan kentang, aduk rata, sajikan dengan nasi.", 60)],
    ),
    (
        "Sayur Lodeh Labu Siam", 3, "#E8C07D", 25, ["Kompor", "Rice cooker"],
        "Aduk santan terus supaya nggak pecah.",
        [("Labu siam", 1, 0), ("Tempe", 0.5, 0), ("Bawang merah", 2, 0), ("Cabai rawit", 3, 0), ("Santan instan", 1, 1), ("Nasi putih", 1, 2)],
        [("Rebus 400 ml air dengan bawang merah, cabai, labu dan tempe.", 480), ("Masukkan santan, aduk pelan sampai mendidih.", 240), ("Sajikan dengan nasi hangat.", 0)],
    ),
    # 16-40: added with the Tangsel data refresh
    (
        "Orek Tempe Kering Manis Pedas", 2, "#A0692E", 20, ["Kompor"],
        "Iris tempe tipis seperti korek api supaya cepat kering dan awet 2-3 hari.",
        [("Tempe", 1, 0), ("Minyak goreng", 3, 0), ("Bawang merah", 3, 1), ("Bawang putih", 2, 1), ("Cabai rawit", 5, 1), ("Kecap manis", 2, 2), ("Gula merah", 1, 2), ("Nasi putih", 1, 2)],
        [("Iris tempe tipis memanjang, goreng sampai kecokelatan, angkat.", 300), ("Tumis bawang merah, bawang putih dan cabai iris sampai harum.", 90), ("Masukkan tempe, kecap dan gula merah, aduk sampai bumbu meresap dan kering.", 180)],
    ),
    (
        "Tahu Telur Kecap", 1, "#E3A646", 15, ["Kompor"],
        "Tahu dipotong dadu kecil supaya bisa menyatu dengan telurnya.",
        [("Tahu", 2, 0), ("Telur ayam", 1, 0), ("Daun bawang", 1, 0), ("Garam", 1, 0), ("Minyak goreng", 2, 1), ("Kecap manis", 1, 2), ("Cabai rawit", 2, 2), ("Nasi putih", 1, 2)],
        [("Kocok telur dengan tahu dadu, daun bawang dan garam.", 60), ("Goreng adonan seperti dadar tebal sampai kedua sisi kecokelatan.", 240), ("Siram kecap dan taburi irisan cabai, sajikan dengan nasi.", 0)],
    ),
    (
        "Sayur Sop Ayam Hemat", 3, "#E8B27C", 30, ["Kompor", "Rice cooker"],
        "Rebus ayam dengan api kecil supaya kaldunya bening dan gurih.",
        [("Ayam potong", 1, 0), ("Bawang putih", 2, 0), ("Wortel", 1, 1), ("Kentang", 1, 1), ("Kol", 1, 2), ("Daun bawang", 1, 2), ("Garam", 1, 2), ("Lada bubuk", 0.25, 2), ("Nasi putih", 1, 2)],
        [("Rebus ayam dengan 600 ml air dan bawang putih geprek.", 900), ("Masukkan wortel dan kentang potong dadu, masak sampai empuk.", 480), ("Tambah kol, daun bawang, garam dan lada, masak 2 menit lalu sajikan.", 120)],
    ),
    (
        "Capcay Kuah Bakso", 3, "#D9A05B", 15, ["Kompor"],
        "Pakai sayur apa saja yang tersisa di kulkas, capcay itu fleksibel.",
        [("Bawang putih", 2, 0), ("Minyak goreng", 1, 0), ("Bakso sapi", 3, 1), ("Wortel", 1, 1), ("Sawi putih", 1, 1), ("Kol", 1, 1), ("Saus tiram", 1, 2), ("Garam", 1, 2), ("Nasi putih", 1, 2)],
        [("Tumis bawang putih sampai harum.", 60), ("Masukkan bakso iris, wortel, sawi putih, kol dan 200 ml air.", 240), ("Tambah saus tiram dan garam, masak sampai sayur layu.", 60)],
    ),
    (
        "Tumis Sawi Bakso Bawang Putih", 2, "#7DAE6B", 10, ["Kompor"],
        "Sawi dimasak sebentar saja supaya tetap renyah.",
        [("Bawang putih", 3, 0), ("Minyak goreng", 1, 0), ("Bakso sapi", 3, 0), ("Sawi hijau", 1, 1), ("Saus tiram", 1, 1), ("Nasi putih", 1, 2)],
        [("Tumis bawang putih cincang dan bakso iris sampai harum.", 90), ("Masukkan sawi dan saus tiram, aduk di api besar.", 90), ("Angkat dan sajikan dengan nasi.", 0)],
    ),
    (
        "Terong Balado", 2, "#7E4A8C", 20, ["Kompor"],
        "Goreng terong sebentar supaya warnanya tetap ungu cantik.",
        [("Terong ungu", 1, 0), ("Minyak goreng", 3, 0), ("Cabai merah keriting", 4, 1), ("Cabai rawit", 3, 1), ("Bawang merah", 3, 1), ("Tomat", 1, 1), ("Gula pasir", 1, 2), ("Garam", 1, 2), ("Nasi putih", 1, 2)],
        [("Potong terong, goreng sebentar sampai layu, angkat.", 180), ("Tumis cabai, bawang merah dan tomat yang diulek kasar.", 180), ("Masukkan terong, gula dan garam, aduk rata lalu sajikan.", 60)],
    ),
    (
        "Tumis Kacang Panjang Tempe", 2, "#8DB360", 15, ["Kompor"],
        "Potong kacang panjang 3 cm supaya matangnya rata.",
        [("Bawang merah", 3, 0), ("Bawang putih", 2, 0), ("Cabai rawit", 3, 0), ("Minyak goreng", 2, 0), ("Tempe", 0.5, 1), ("Kacang panjang", 1, 1), ("Kecap manis", 1, 2), ("Garam", 1, 2), ("Nasi putih", 1, 2)],
        [("Tumis bawang merah, bawang putih dan cabai.", 60), ("Masukkan tempe dadu dan kacang panjang, beri sedikit air.", 300), ("Tambah kecap dan garam, aduk sampai meresap.", 60)],
    ),
    (
        "Telur Ceplok Kecap Bawang", 1, "#F0B23C", 10, ["Kompor"],
        "Ceplok dengan api sedang supaya pinggirnya garing tapi kuningnya masih lembut.",
        [("Minyak goreng", 2, 0), ("Telur ayam", 2, 0), ("Bawang merah", 3, 1), ("Cabai rawit", 3, 1), ("Kecap manis", 2, 1), ("Nasi putih", 1, 2)],
        [("Ceplok telur satu per satu, angkat.", 180), ("Tumis bawang merah dan cabai iris, tambah kecap dan 2 sdm air.", 90), ("Siram saus kecap ke atas telur, sajikan dengan nasi.", 0)],
    ),
    (
        "Nasi Liwet Teri Rice Cooker", 1, "#D8C27A", 35, ["Rice cooker"],
        "Semua masuk sekaligus ke rice cooker, tinggal tekan cook.",
        [("Nasi putih", 1, 0), ("Teri nasi", 2, 0), ("Bawang merah", 3, 0), ("Bawang putih", 2, 0), ("Daun salam & lengkuas", 1, 0), ("Cabai rawit", 3, 0), ("Garam", 1, 0), ("Minyak goreng", 1, 0), ("Daun bawang", 1, 2)],
        [("Masukkan beras yang sudah dicuci, air, teri, bawang iris, salam, lengkuas, cabai, garam dan minyak ke rice cooker.", 0), ("Masak dengan mode cook sampai matang.", 1500), ("Aduk, taburi daun bawang, diamkan 5 menit lalu sajikan.", 300)],
    ),
    (
        "Bihun Goreng Sayur", 3, "#E0B566", 15, ["Kompor"],
        "Rendam bihun di air panas cukup 3 menit, jangan sampai terlalu lembek.",
        [("Bihun", 1, 0), ("Bawang putih", 2, 1), ("Minyak goreng", 2, 1), ("Telur ayam", 1, 1), ("Kol", 1, 1), ("Wortel", 0.5, 1), ("Kecap manis", 1, 2), ("Kecap asin", 1, 2), ("Daun bawang", 1, 2)],
        [("Rendam bihun di air panas sampai lunak, tiriskan.", 180), ("Tumis bawang putih, orak-arik telur, masukkan kol dan wortel.", 180), ("Masukkan bihun, kecap manis, kecap asin dan daun bawang, aduk rata.", 90)],
    ),
    (
        "Mie Telur Kuah Sawi Bakso", 3, "#E8A35C", 15, ["Kompor", "Rice cooker"],
        "Rebus mie terpisah supaya kuahnya tetap bening.",
        [("Bawang putih", 2, 0), ("Kaldu bubuk", 1, 0), ("Bakso sapi", 3, 0), ("Mie telur", 1, 1), ("Sawi hijau", 0.5, 1), ("Lada bubuk", 0.25, 2), ("Daun bawang", 1, 2)],
        [("Didihkan 400 ml air dengan bawang putih geprek, kaldu dan bakso.", 240), ("Masukkan mie telur dan sawi, masak 3 menit.", 180), ("Tambah lada dan daun bawang, sajikan panas.", 0)],
    ),
    (
        "Ayam Goreng Bawang Putih", 1, "#C9893A", 30, ["Kompor"],
        "Ungkep ayam dulu supaya bumbunya meresap sampai ke dalam.",
        [("Ayam potong", 1, 0), ("Bawang putih", 4, 0), ("Garam", 1, 0), ("Lada bubuk", 0.25, 0), ("Minyak goreng", 4, 1), ("Saus sambal", 1, 2), ("Nasi putih", 1, 2)],
        [("Rebus ayam dengan bawang putih halus, garam, lada dan sedikit air sampai airnya habis.", 900), ("Goreng ayam di minyak panas sampai kecokelatan.", 420), ("Sajikan dengan nasi dan saus sambal.", 0)],
    ),
    (
        "Lele Goreng Sambal Tomat", 2, "#8A9A6B", 25, ["Kompor"],
        "Keringkan lele dengan tisu sebelum digoreng supaya minyak nggak meletup.",
        [("Ikan lele", 1, 0), ("Garam", 1, 0), ("Jeruk nipis", 0.5, 0), ("Minyak goreng", 4, 1), ("Tomat", 1, 2), ("Cabai rawit", 5, 2), ("Bawang merah", 2, 2), ("Timun", 0.5, 2), ("Nasi putih", 1, 2)],
        [("Lumuri lele dengan garam dan perasan jeruk nipis, diamkan 10 menit.", 600), ("Goreng lele sampai kering dan renyah.", 480), ("Ulek tomat, cabai dan bawang merah goreng jadi sambal, sajikan dengan timun dan nasi.", 120)],
    ),
    (
        "Tumis Brokoli Wortel", 2, "#5F9E5A", 12, ["Kompor"],
        "Rebus brokoli 1 menit dulu supaya warnanya hijau terang.",
        [("Brokoli", 1, 0), ("Wortel", 1, 0), ("Bawang putih", 3, 1), ("Minyak goreng", 1, 1), ("Saus tiram", 1, 1), ("Garam", 1, 1), ("Nasi putih", 1, 2)],
        [("Rebus sebentar brokoli dan wortel iris, tiriskan.", 90), ("Tumis bawang putih, masukkan sayur, saus tiram, garam dan 2 sdm air.", 120), ("Angkat dan sajikan dengan nasi.", 0)],
    ),
    (
        "Pakcoy Saus Tiram Bawang", 2, "#6DAA62", 8, ["Kompor"],
        "Belah pakcoy jadi dua supaya bagian batangnya cepat matang.",
        [("Bawang putih", 3, 0), ("Minyak goreng", 1, 0), ("Pakcoy", 1, 1), ("Saus tiram", 1, 1), ("Kecap asin", 1, 1), ("Nasi putih", 1, 2)],
        [("Tumis bawang putih cincang sampai kecokelatan.", 60), ("Masukkan pakcoy, saus tiram, kecap asin dan 3 sdm air, tutup 1 menit.", 90), ("Sajikan dengan nasi.", 0)],
    ),
    (
        "Jamur Tiram Crispy", 2, "#C9A46A", 15, ["Kompor"],
        "Peras jamur sampai benar-benar kering supaya tepungnya renyah.",
        [("Jamur tiram", 1, 0), ("Tepung bumbu", 0.5, 0), ("Minyak goreng", 5, 1), ("Saus sambal", 1, 2), ("Nasi putih", 1, 2)],
        [("Suwir jamur, peras, lalu baluri dengan tepung bumbu kering.", 120), ("Goreng di minyak panas sampai keemasan.", 240), ("Tiriskan, sajikan dengan saus sambal dan nasi.", 0)],
    ),
    (
        "Tempe Mendoan", 2, "#B59A4E", 15, ["Kompor"],
        "Goreng sebentar saja, mendoan yang enak itu masih agak lembek.",
        [("Tepung terigu", 4, 0), ("Bawang putih", 2, 0), ("Daun bawang", 1, 0), ("Garam", 1, 0), ("Tempe", 1, 1), ("Minyak goreng", 4, 1), ("Kecap manis", 1, 2), ("Cabai rawit", 3, 2), ("Nasi putih", 1, 2)],
        [("Campur tepung, bawang putih halus, daun bawang, garam dan air jadi adonan kental.", 120), ("Celup tempe iris tipis ke adonan, goreng 1 menit tiap sisi.", 240), ("Sajikan dengan cocolan kecap dan cabai rawit.", 0)],
    ),
    (
        "Oatmeal Telur Gurih Microwave", 3, "#D9C08C", 5, ["Microwave"],
        "Aduk di tengah proses supaya telurnya matang merata.",
        [("Oatmeal", 4, 0), ("Kaldu bubuk", 1, 0), ("Telur ayam", 1, 1), ("Daun bawang", 1, 2), ("Kecap asin", 0.5, 2)],
        [("Campur oatmeal, kaldu bubuk dan 200 ml air di mangkuk tahan panas.", 0), ("Microwave 90 detik, masukkan telur kocok, aduk, microwave 60 detik lagi.", 150), ("Taburi daun bawang dan sedikit kecap asin.", 0)],
    ),
    (
        "Roti Telur Keju Teflon", 1, "#EDBA4A", 10, ["Kompor"],
        "Pakai api kecil supaya roti garing tapi nggak gosong.",
        [("Telur ayam", 1, 0), ("Garam", 0.5, 0), ("Margarin", 1, 1), ("Roti tawar", 2, 1), ("Keju lembaran", 1, 1), ("Saus tomat", 1, 2)],
        [("Kocok telur dengan sedikit garam.", 30), ("Lelehkan margarin, celup roti ke telur, panggang, beri keju lalu tangkupkan.", 240), ("Potong dua, sajikan dengan saus tomat.", 0)],
    ),
    (
        "Mie Goreng Microwave", 3, "#E7B24F", 6, ["Microwave"],
        "Patahkan mie jadi dua supaya terendam air dan matangnya rata.",
        [("Indomie", 1, 0), ("Telur ayam", 1, 1), ("Sawi hijau", 0.25, 1), ("Cabai rawit", 2, 2)],
        [("Masukkan mie dan 300 ml air ke mangkuk tahan panas, microwave 3 menit.", 180), ("Buang airnya, masukkan telur kocok dan sawi, microwave 60 detik.", 60), ("Aduk dengan bumbu mie dan irisan cabai.", 0)],
    ),
    (
        "Tim Telur Tahu Rice Cooker", 1, "#EBCB7A", 25, ["Rice cooker"],
        "Taruh mangkuk di atas nasi yang sedang dimasak, sekali masak dapat dua.",
        [("Telur ayam", 2, 0), ("Tahu", 1, 0), ("Kaldu bubuk", 1, 0), ("Daun bawang", 1, 0), ("Nasi putih", 1, 1), ("Kecap asin", 1, 2)],
        [("Kocok telur dengan tahu hancur, kaldu, daun bawang dan 100 ml air di mangkuk.", 60), ("Letakkan mangkuk di atas beras di rice cooker, masak bersama nasi.", 1200), ("Siram sedikit kecap asin, sajikan dengan nasi.", 0)],
    ),
    (
        "Ubi Kukus Gula Merah", 2, "#C87F4A", 30, ["Rice cooker", "Kompor"],
        "Sarapan murah yang bikin kenyang lama, cocok sebelum kelas pagi.",
        [("Ubi jalar", 1, 0), ("Gula merah", 2, 2), ("Garam", 0.5, 2)],
        [("Cuci ubi, potong besar, kukus di rice cooker atau panci.", 0), ("Kukus sampai empuk saat ditusuk garpu.", 1500), ("Lelehkan gula merah dengan sedikit air dan garam, siram ke ubi.", 120)],
    ),
    (
        "Gado-gado Sederhana", 2, "#B9A44C", 25, ["Kompor"],
        "Bumbu kacang bisa dibuat banyak dan disimpan di kulkas sampai 3 hari.",
        [("Kentang", 1, 0), ("Telur ayam", 1, 0), ("Kol", 1, 0), ("Tauge", 0.5, 0), ("Tahu", 1, 1), ("Minyak goreng", 2, 1), ("Kacang tanah", 3, 2), ("Gula merah", 1, 2), ("Cabai rawit", 2, 2), ("Bawang putih", 1, 2), ("Timun", 0.5, 2), ("Kerupuk", 1, 2)],
        [("Rebus kentang, telur, kol dan tauge sampai matang.", 600), ("Goreng tahu sampai kecokelatan.", 240), ("Haluskan kacang goreng, gula merah, cabai, bawang putih dan air jadi saus, siram ke sayur, tambah timun dan kerupuk.", 300)],
    ),
    (
        "Udang Saus Tiram", 1, "#E07A52", 15, ["Kompor"],
        "Udang cepat matang, begitu berubah oranye langsung angkat supaya nggak alot.",
        [("Bawang putih", 3, 0), ("Bawang bombay", 0.5, 0), ("Minyak goreng", 2, 0), ("Udang kupas", 1, 1), ("Saus tiram", 1, 1), ("Kecap manis", 1, 1), ("Daun bawang", 1, 2), ("Nasi putih", 1, 2)],
        [("Tumis bawang putih dan bawang bombay sampai harum.", 90), ("Masukkan udang, saus tiram, kecap dan 3 sdm air, masak 3 menit.", 180), ("Taburi daun bawang, sajikan dengan nasi.", 0)],
    ),
    (
        "Ati Ampela Kecap Pedas", 1, "#9C4A2F", 25, ["Kompor"],
        "Rebus ati ampela dulu dengan salam supaya nggak amis.",
        [("Ati ampela", 2, 0), ("Daun salam & lengkuas", 1, 0), ("Bawang merah", 3, 1), ("Bawang putih", 2, 1), ("Cabai rawit", 6, 1), ("Minyak goreng", 2, 1), ("Kecap manis", 2, 2), ("Nasi putih", 1, 2)],
        [("Rebus ati ampela dengan salam dan lengkuas, potong-potong.", 600), ("Tumis bawang merah, bawang putih dan cabai sampai harum.", 90), ("Masukkan ati ampela dan kecap, masak sampai bumbu mengental.", 240)],
    ),
]

# Cheap places around BINUS @Alam Sutera (Jl. Jalur Sutera Barat). Names, opening hours and
# straight-line distance come from public map listings; `price` is our own estimate of a
# typical cheap order (nasi + 1 sayur + 1 lauk, or a small vegetable haul) and stays flagged
# as unverified until the team checks it in person. No ratings are stored: the app only
# shows ratings given by our own users.
# name, kind, distance, open, close, price, tags, area
SPOTS = [
    ("Pangkalan Sayuran Bang Jamal", "Sayur", "240 m", "06:30", "23:45", 10000, ["Sayur", "Protein"], "Jl. Kyai Maja, Panunggangan"),
    ("Soto Tangkar Pak Warso", "Warung", "310 m", "07:00", "21:00", 15000, ["Nasi", "Protein"], "Jl. Kyai Maja, Panunggangan"),
    ("Mama Djempol Alam Sutera", "Warung", "320 m", "08:00", "19:00", 15000, ["Nasi", "Sayur", "Protein"], "Jl. Lingkar Barat, Alam Sutera"),
    ("Dapur Alsut", "Warung", "940 m", "08:00", "22:00", 18000, ["Nasi", "Sayur", "Protein"], "Ruko Prominence, Alam Sutera"),
    ("Warteg Bumi Bahari Alam Sutera", "Warteg", "1,1 km", "00:00", "24:00", 13000, ["Nasi", "Sayur", "Protein"], "Jl. Ki Male, Panunggangan Timur"),
    ("Warteg Ibu Sri Jaya Bahari 01", "Warteg", "1,2 km", "00:00", "24:00", 12000, ["Nasi", "Sayur", "Protein"], "Pakualam, Serpong Utara"),
    ("Warteg Sutera Bahari Renata", "Warteg", "1,3 km", "00:00", "24:00", 12000, ["Nasi", "Sayur", "Protein"], "Kunciran, Pinang"),
    ("Duta Sayur dan Buah", "Sayur", "1,4 km", "06:00", "21:00", 10000, ["Sayur"], "Kebon Nanas, Panunggangan Utara"),
    ("Pasar Segar 88", "Pasar", "1,8 km", "07:00", "16:00", 15000, ["Sayur", "Protein"], "Jl. Jalur Sutera, Pakulonan"),
    ("Pasar 8 Alam Sutera", "Pasar", "1,8 km", "07:00", "24:00", 20000, ["Nasi", "Sayur", "Protein"], "Jl. Alam Utama, Pakulonan"),
]

DEMO_EMAIL = "dinda@sharebite.id"
DEMO_PASSWORD = "hemat123"
CAMPUS = "BINUS University @Alam Sutera"


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
    for name, kind, dist, f, t, price, tags, area in SPOTS:
        db.add(
            models.Spot(
                name=name, kind=kind, distance=dist, open_from=f, open_to=t, price=price, rating=None, tags=tags,
                city="Alam Sutera", address=area, price_verified=False,
            )
        )
    db.flush()

    # Demo user with some history
    now = datetime.now(timezone.utc)
    demo = models.User(
        email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD), name="Dinda Aprilia",
        campus=CAMPUS, daily_budget=15000, shop_budget=35000, tier="brunch",
        prefs=["Halal", "Pedas", "Rice cooker", "Kompor"],
    )
    db.add(demo)
    db.flush()
    for days_ago, amount in zip(range(6, 0, -1), [12500, 9500, 14000, 8800, 11000, 7500]):
        db.add(models.Expense(user_id=demo.id, amount=amount, budget=15000, created_at=now - timedelta(days=days_ago)))
    db.add(models.SavedRecipe(user_id=demo.id, recipe_id=1))
    for name, qty, unit, price, cat, done in [
        ("Kangkung", 1, "ikat", 2500, "Sayuran", True), ("Telur ayam", 6, "btr", 10800, "Protein", False),
        ("Tempe", 1, "papan", 4000, "Protein", False), ("Bawang merah", 1, "ons", 3900, "Bumbu", True),
        ("Cabai rawit", 50, "g", 4800, "Bumbu", False), ("Indomie", 5, "bks", 14600, "Karbo", False),
    ]:
        db.add(models.CartItem(user_id=demo.id, name=name, qty=qty, unit=unit, price=price, category=cat, done=done))

    # Community posts
    posts = [
        models.Post(
            author_name="Rina", campus="BINUS Alam Sutera", type="Resep", recipe_id=2, cost=9500,
            title="Tumis Kangkung Tempe Orek cuma Rp9.500 sepiring!",
            body="Kangkung seikat Rp2.500 sama tempe papan Rp4.000 dari tukang sayur dekat kos. Sisanya bumbu dapur. Kangkung masuk terakhir biar tetap hijau!",
            base_likes=142, created_at=now - timedelta(hours=2),
        ),
        models.Post(
            author_name="Budi", campus="Kos Kunciran", type="Info Warung",
            title="Pulang kelas malam? Pangkalan sayur di Jl. Kyai Maja buka sampai hampir tengah malam",
            body="Masih bisa beli sayur dan telur buat masak besok. Datang sebelum jam 9 malam biar pilihannya masih lengkap.",
            location="Jl. Kyai Maja, Panunggangan", base_likes=89, created_at=now - timedelta(hours=5),
        ),
        models.Post(
            author_name="Dimas", campus="Kos Pakualam", type="Trik Masak", recipe_id=8, cost=5200,
            title="Tumis Toge Tahu Saus Tiram: modal Rp5.200 buat sarapan",
            body="Tahu 2 biji, toge seplastik kecil, saus tiram sachet. Masak 5 menit, di rice cooker mode cook pun jadi!",
            cook_time="5 - 7 Menit", per_portion="Rp5.200 / org", base_likes=204, created_at=now - timedelta(days=1),
        ),
    ]
    db.add_all(posts)
    db.flush()
    for post, who, text in [
        (posts[0], "Sari", "Wah aku coba besok, makasih tipsnya!"),
        (posts[0], "Andre", "Tempenya beli di mana kak?"),
        (posts[1], "Lala", "Valid, aku sering beli pulang kelas malam."),
        (posts[2], "Rina", "Saus tiram sachet emang penyelamat akhir bulan 😂"),
    ]:
        db.add(models.Comment(post_id=post.id, author_name=who, text=text))

    db.commit()
