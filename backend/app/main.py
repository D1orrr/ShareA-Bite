import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models  # noqa: F401  (registers tables)
from app.config import settings
from app.database import Base, SessionLocal, engine, get_db
from app.routers import auth, cart, community, recipes
from app.seed import seed


def init_db() -> None:
    """Create tables and load demo data on first run (fresh clone = zero setup)."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="ShareA'Bite — budget-first recipe generator, spending tracker & community for anak kos",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,  # auth uses a bearer token, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

P = settings.API_V1_PREFIX
for r in (auth.router, recipes.router, cart.router, community.router):
    app.include_router(r, prefix=P)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(f"{P}/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"app": settings.PROJECT_NAME, "version": settings.PROJECT_VERSION, "status": "online", "docs": "/docs"}


@app.get(f"{P}/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:  # pragma: no cover
        db_status = f"error: {e}"
    return {"status": "healthy", "database": db_status, "ai": "gemini" if settings.gemini_enabled else "rules"}
