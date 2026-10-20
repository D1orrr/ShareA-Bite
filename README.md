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
│   │   ├── _layout.tsx       # Root layout: fonts, theme, toast, screen stack
│   │   ├── +html.tsx         # Web page shell (language, focus ring)
│   │   ├── index.tsx         # Welcome: sign-up buttons or continue as guest
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
│   ├── constants/            # theme.ts (colors, fonts, Rupiah format), data.ts (mock data)
│   ├── context/
│   │   └── AppStore.tsx      # App state (budget, saved recipes, cart, ...)
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

Deep green on a soft lavender-white page, with a warm orange for highlights. Recipe costs are shown as a shop receipt (dotted lines, dashed total, barcode), and Si Mangkok, a rice-bowl mascot, appears on the loading, empty and finish screens. Headings and numbers use Plus Jakarta Sans, body text uses Be Vietnam Pro, and icons are Material Symbols.

Phones get a bottom tab bar. From 900px wide the tabs move into the top bar and screens use two columns. Dark mode follows the device setting and can be switched in Profil.

Colors, fonts and the Rupiah formatter live in `frontend/constants/theme.ts`.

---

## Known Limitations

- All data is mock data in `frontend/constants/data.ts`. Nothing is saved, so reloading the app resets everything, including the dark mode switch.
- Recipe generation is simulated. Generate Recipe shows the loading animation, then the same three recipes whatever you pick. The frontend does not call the backend yet.
- "Daftar dengan email" and "Lanjut dengan Google" go straight to onboarding; there is no sign-in yet.
- Notifications, Buka Maps, sharing, drafts and photo upload only show a short message. The map on Tempat Murah is a drawing, not a real map.
- On phones narrower than about 360px, the "Daftar Belanja" tab label wraps onto two lines.
- The UI has been tested in the browser at phone, tablet, and desktop sizes, but not yet on physical iOS or Android devices.
