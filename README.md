# Share'N'Bite 🍳 (Monorepo MVP)

> **Budget-first recipe generator, smart financial tracker, and UGC community for university students ("anak kos").**
> *Designed with Neo-brutalism aesthetics for Mobile & Web.*

---

## 📁 Monorepo Structure

```text
├── backend/                  # FastAPI + SQLite + SQLAlchemy
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py         # Pydantic Settings (.env configuration)
│   │   ├── database.py       # SQLite connection & SessionLocal dependency
│   │   └── main.py           # FastAPI app, CORS, and /api/health endpoint
│   ├── venv/                 # Python 3.12 virtual environment
│   ├── .env.example          # Sample environment variables
│   ├── .env                  # Local development config
│   ├── .gitignore
│   └── requirements.txt      # FastAPI, Uvicorn, SQLAlchemy, Google-GenAI, etc.
│
├── frontend/                 # Universal Expo App (Mobile & Web)
│   ├── app/
│   │   ├── _layout.tsx       # Expo Router root layout with Neo-brutalist theme
│   │   └── index.tsx         # Neo-brutalist showcase & live API health badge
│   ├── assets/               # Icons & app images
│   ├── app.json              # Expo configuration (Expo Router & web static enabled)
│   ├── babel.config.js       # Babel preset for NativeWind v4
│   ├── metro.config.js       # Metro configuration for NativeWind CSS
│   ├── tailwind.config.js    # Neo-brutalism design system (colors, borders, hard shadows)
│   ├── global.css            # Tailwind directives
│   ├── nativewind-env.d.ts   # TypeScript typings for NativeWind & CSS modules
│   ├── tsconfig.json         # Strict TypeScript configuration
│   └── package.json          # Expo SDK 57, React Native 0.86, Expo Router, NativeWind
│
└── README.md
```

---

## ⚡ Terminal Commands to Run

Open two terminal windows in the project root:

### 1. Terminal 1: Backend (FastAPI + SQLite)

**Windows (PowerShell):**
```powershell
cd "c:\Binus Learning\Sem.5\backend"
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> **API Documentation:** Interactive Swagger UI will be live at `http://localhost:8000/docs`  
> **Health Check Endpoint:** `http://localhost:8000/api/health`

---

### 2. Terminal 2: Frontend (Expo Universal App)

**For Web (Desktop Browser):**
```powershell
cd "c:\Binus Learning\Sem.5\frontend"
npx expo start --web
```

**For Mobile (Expo Go on iOS / Android or Emulator):**
```powershell
cd "c:\Binus Learning\Sem.5\frontend"
npx expo start
```
*(Scan the terminal QR code using the Expo Go mobile app or press `a` for Android Emulator / `w` for Web).*
