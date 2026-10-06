# Share'N'Bite 🍳 (Monorepo MVP)

> **Budget-first recipe generator, smart financial tracker, and UGC community for university students ("anak kos").**
> *Warm, clean design for Mobile & Web.*

---

## 📁 Monorepo Structure

```text
├── backend/                  # FastAPI + SQLite + SQLAlchemy
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py         # Pydantic Settings (.env configuration)
│   │   ├── database.py       # SQLite connection & SessionLocal dependency
│   │   └── main.py           # FastAPI app, CORS, and /api/health endpoint
│   ├── .env.example          # Sample environment variables (copy to .env)
│   ├── .gitignore
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Universal Expo App (Mobile & Web)
│   ├── app/
│   │   ├── _layout.tsx       # Root layout: providers, status bar, icon font
│   │   ├── index.tsx         # Redirects to the tabs
│   │   └── (tabs)/
│   │       ├── _layout.tsx   # Bottom tab bar
│   │       ├── index.tsx     # AI Racik: budget + ingredients -> recipe ideas
│   │       ├── shopping.tsx  # Belanja: shopping checklist grouped by category
│   │       ├── create.tsx    # Buat Resep: recipe editor, publish to Komunitas
│   │       ├── community.tsx # Komunitas: recipes, saving tips, cheap markets
│   │       └── profile.tsx   # Cuan & Kos: level, badges, weekly spending
│   ├── components/           # Shared UI (Button, Chip, Card, Dialog, Toast, ...)
│   ├── constants/            # colors.js (palette), format.ts (Rupiah formatting)
│   ├── context/
│   │   └── AppContext.tsx    # App state and mock data
│   ├── assets/               # Icons & app images
│   ├── app.json              # Expo configuration (Expo Router & web static enabled)
│   ├── babel.config.js       # Babel preset for NativeWind v4
│   ├── metro.config.js       # Metro configuration for NativeWind CSS
│   ├── tailwind.config.js    # Tailwind theme (colors come from constants/colors.js)
│   ├── global.css            # Tailwind directives
│   ├── nativewind-env.d.ts   # TypeScript typings for NativeWind & CSS modules
│   ├── tsconfig.json         # Strict TypeScript configuration
│   └── package.json          # Expo SDK 57, React Native 0.86, Expo Router, NativeWind
│
└── README.md
```

---

## Requirements

- **Node.js** LTS 22 or 24, or newer (frontend)
- **Python** 3.12 (backend)

---

## ⚡ Terminal Commands to Run

The frontend runs on mock data for now, so you can start it without the backend.

### 1. Frontend (Expo Universal App)

```bash
cd frontend
npm install            # first time only
npx expo start --web   # opens the app in your browser
```

**For Mobile (Expo Go on iOS / Android or Emulator):** run `npx expo start` and scan the QR code with the Expo Go app, or press `a` for the Android Emulator / `w` for Web.

If the styling looks wrong after you pull changes, switch branches, or edit `tailwind.config.js` or `metro.config.js`, restart with a clean cache:

```bash
npx expo start --web --clear
```

### 2. Backend (FastAPI + SQLite)

**macOS / Linux:**
```bash
cd backend
python3.12 -m venv venv            # first time only
source venv/bin/activate
pip install -r requirements.txt    # first time only
cp .env.example .env               # first time only
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Windows (PowerShell):**
```powershell
cd backend
py -3.12 -m venv venv              # first time only
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt    # first time only
copy .env.example .env             # first time only
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **API Documentation:** Interactive Swagger UI will be live at `http://localhost:8000/docs`
> **Health Check Endpoint:** `http://localhost:8000/api/health`

---

## Design

Warm off-white background, white cards, and one tomato-orange accent for the main action on each screen. Green marks savings and finished items. Price lists use a receipt layout: amounts aligned on the right, with a dashed line before the totals.

The palette lives in `frontend/constants/colors.js` and feeds `tailwind.config.js`, so change colors there. Text and background pairs meet WCAG AA contrast.

---

## Known Limitations

- All data is mock data in `frontend/context/AppContext.tsx`. Nothing is saved, so reloading the app resets everything.
- AI Racik is simulated. The generate button waits briefly, then shows the same two sample recipes whatever you pick. The frontend does not call the backend yet.
- "Selesai Belanja • Simpan ke Pengeluaran Kos" shows a confirmation but does not record the expense or update the spending chart.
- On very narrow phones (about 320px wide, such as the first-generation iPhone SE), the "Buat Resep" and "Cuan & Kos" tab labels are cut off by a few pixels.
- Light theme only.
- The UI has been tested in the browser at phone, tablet, and desktop sizes, but not yet on physical iOS or Android devices.
