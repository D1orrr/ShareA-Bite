# ShareA'Bite 🍳 (Monorepo MVP)

> **Budget-first recipe generator, smart financial tracker, and UGC community for university students ("anak kos").**
> *Warm, clean design for Mobile & Web.*

---

## 📁 Monorepo Structure

```text
├── backend/                  # FastAPI + SQLite + SQLAlchemy
│   ├── app/
│   │   ├── main.py           # FastAPI app, CORS, routers; creates + seeds the DB on startup
│   │   ├── config.py         # Settings from .env (DB url, secret key, optional Gemini key)
│   │   ├── database.py       # SQLAlchemy engine & session
│   │   ├── models.py         # Tables: users, ingredients (price table), recipes, cart, expenses, posts, …
│   │   ├── seed.py           # Demo data: 29 ingredient prices, 15 recipes, spots, posts, demo user
│   │   ├── security.py       # Password hashing + JWT bearer auth
│   │   ├── routers/          # auth & profile, recipes & saved, cart & expenses, community & spots
│   │   └── services/recipes.py # Cost/nutrition maths, cheaper swaps, recipe generator (+ Gemini)
│   ├── tests/                # pytest API tests
│   ├── .env.example          # Optional settings (copy to .env)
│   ├── requirements.txt      # Python dependencies
│   └── requirements-dev.txt  # pytest
│
├── frontend/                 # Universal Expo App (Mobile & Web)
│   ├── app/
│   │   ├── _layout.tsx       # Root layout: fonts, theme, toast, screen stack
│   │   ├── +html.tsx         # Web page shell (language, focus ring)
│   │   ├── index.tsx         # Welcome: sign-up buttons or continue as guest
│   │   ├── auth.tsx          # Register / login with email
│   │   ├── onboard.tsx       # 3 steps: weekly budget, diet, cooking tools
│   │   ├── loading.tsx       # Si Mangkok "cooking" while recipes are generated
│   │   ├── cook/[id].tsx     # Step-by-step cooking mode with timers
│   │   ├── finish/[id].tsx   # Log what the meal cost
│   │   └── (tabs)/
│   │       ├── _layout.tsx   # Header and tab bar (bottom on phones, top on desktop)
│   │       ├── home.tsx      # Explore: daily budget, filters, Generate Recipe
│   │       ├── results.tsx   # Three recipes for the budget
│   │       ├── recipe/[id].tsx # Recipe: receipt, steps, nutrition
│   │       ├── simpan.tsx    # Saved recipes
│   │       ├── belanja.tsx   # Daftar Belanja: shopping checklist and total
│   │       ├── spots.tsx     # Tempat Murah: cheap places near campus
│   │       ├── komunitas.tsx # Komunitas: posts, filters, share sheet
│   │       └── akun.tsx      # Profil: stats, spending chart, settings
│   ├── components/           # Shared UI: ui.tsx (buttons, cards, chips, ...), nav, mascot and food art, icons
│   ├── constants/            # theme.ts (colors, fonts, Rupiah format), data.ts (types + offline sample data)
│   ├── context/
│   │   └── AppStore.tsx      # App state: talks to the API, or falls back to offline mode
│   ├── lib/
│   │   ├── api.ts            # API client, JSON → app types, automatic backend URL
│   │   └── useRecipe.ts      # Load a recipe by id (cache → API → offline)
│   ├── assets/               # App icons and the Material Symbols icon fonts
│   ├── app.json              # Expo configuration (Expo Router & web static enabled)
│   ├── babel.config.js       # Babel preset for NativeWind v4
│   ├── metro.config.js       # Metro configuration for NativeWind CSS
│   ├── tailwind.config.js    # Tailwind theme (Cozy tokens)
│   ├── global.css            # Tailwind directives
│   ├── nativewind-env.d.ts   # TypeScript typings for NativeWind & CSS modules
│   ├── tsconfig.json         # Strict TypeScript configuration
│   └── package.json          # Expo SDK 57, React Native 0.86, Expo Router, react-native-svg
│
└── README.md
```

---

## Requirements

- **Node.js** LTS 22 or 24, or newer (frontend)
- **Python** 3.12 (backend)

---

## ⚡ Terminal Commands to Run

Run the backend and the frontend in **two terminals**. The database (SQLite) is created and filled with demo data automatically the first time the backend starts, so there is nothing else to set up.

> Only want to look at the UI? `npx expo start` alone also works: the app detects that the backend is not running and switches to **offline mode** with sample data saved on the device.

### 1. Backend (FastAPI + SQLite)

**macOS / Linux:**
```bash
cd backend
python3 -m venv venv               # first time only
source venv/bin/activate
pip install -r requirements.txt    # first time only
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Windows (PowerShell):**
```powershell
cd backend
py -m venv venv                    # first time only
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt    # first time only
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs (Swagger): `http://localhost:8000/docs` · health check: `http://localhost:8000/api/health`
- Reset all data: stop the server and delete `backend/share_a_bite.db`.
- Tests: `pip install -r requirements-dev.txt && python -m pytest`

### 2. Frontend (Expo Universal App)

```bash
cd frontend
npm install            # first time only
npx expo start --web   # opens the app in your browser
```

**Phone (Expo Go):** run `npx expo start` and scan the QR code. The phone and laptop must be on the same Wi-Fi; the app finds the backend at your laptop's IP automatically (that's why the backend runs with `--host 0.0.0.0`). If your network blocks it, set the URL by hand in `frontend/.env`: `EXPO_PUBLIC_API_URL=http://192.168.x.x:8000`.

If the styling looks wrong after you pull changes or switch branches, restart with a clean cache: `npx expo start --web --clear`.

### Demo account

| Email | Password |
|---|---|
| `dinda@sharebite.id` | `hemat123` |

It already has a week of spending history, a saved recipe and a shopping list. You can also register a new account or continue as a guest.

### AI recipe generation (optional)

Without a key, **Generate Recipe** uses the built-in rule-based generator: it picks from 15 recipes, applies cheaper ingredient swaps until the total fits the budget, and respects diet, allergies, cooking tools and the "Bahan ada" (staples at home) filter. To use Google Gemini instead, get a free key at https://aistudio.google.com/ and put it in `backend/.env`:

```bash
GEMINI_API_KEY=your_key_here
```

Prices from the AI are always recalculated from the ingredient price table, and recipes over budget are dropped.

---

## Design

Deep green on a soft lavender-white page, with a warm orange for highlights. Recipe costs are shown as a shop receipt (dotted lines, dashed total, barcode), and Si Mangkok, a rice-bowl mascot, appears on the loading, empty and finish screens. Headings and numbers use Plus Jakarta Sans, body text uses Be Vietnam Pro, and icons are Material Symbols.

Phones get a bottom tab bar. From 900px wide the tabs move into the top bar and screens use two columns. Dark mode follows the device setting and can be switched in Profil.

Colors, fonts and the Rupiah formatter live in `frontend/constants/theme.ts`.

---

## Known Limitations

- Login with Google is not available yet (email and guest only).
- The map on Tempat Murah is a drawing, not a real map; the list, filters and "Buka Maps" links work.
- The meal reminder (19.00) is shown in Settings but no push notification is sent.
- Uploaded post photos are stored on the backend's disk (`backend/uploads/`); on Vercel they disappear when the function restarts.
- On Vercel the SQLite file lives in `/tmp` and is reset on cold starts — fine for demos, use Postgres (`DATABASE_URL`) for real users.
- On phones narrower than about 360px, the "Daftar Belanja" tab label wraps onto two lines.
- The UI has been tested in the browser at phone, tablet, and desktop sizes, but not yet on physical iOS or Android devices.
