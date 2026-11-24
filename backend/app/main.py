import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models  # noqa: F401  (registers tables)
from app.config import settings
from app.database import IS_SQLITE, Base, SessionLocal, engine, get_db
from app.routers import auth, cart, community, recipes
from app.seed import SEED_VERSION, seed


def init_db() -> None:
    """Create tables and load demo data on first run (fresh clone = zero setup)."""
    if IS_SQLITE:
        _create_and_seed()
        return
    # Postgres is shared by every server instance: let only one of them set it up at a time.
    with engine.connect() as conn:
        conn.execute(text("SELECT pg_advisory_lock(727274)"))
        try:
            _create_and_seed()
        finally:
            conn.execute(text("SELECT pg_advisory_unlock(727274)"))
            conn.commit()


def _create_and_seed() -> None:
    """Create tables and seed them. A database built with older demo data
    (different SEED_VERSION) is wiped and rebuilt, so `git pull` never needs a manual reset."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if _stored_version(db) != str(SEED_VERSION):
            db.close()
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
        with SessionLocal() as db2:
            try:
                seed(db2)
                if not db2.get(models.AppMeta, "seed_version"):
                    db2.add(models.AppMeta(key="seed_version", value=str(SEED_VERSION)))
                    db2.commit()
            except IntegrityError:
                db2.rollback()


def _stored_version(db: Session) -> str | None:
    """Seed version of the existing data; None for an empty database (fresh) or "0" for old data."""
    row = db.get(models.AppMeta, "seed_version")
    if row:
        return row.value
    has_data = db.scalar(text("SELECT 1 FROM ingredients LIMIT 1"))
    return "0" if has_data else str(SEED_VERSION)


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
    from app.services import ai

    out = {"status": "healthy", "database": db_status, "ai": "gemini" if settings.gemini_enabled else "rules"}
    if settings.gemini_enabled:
        out["ai_models"] = settings.gemini_models
        out["ai_available"] = ai.models_to_try()
        out["ai_last"] = ai.status  # model used / last error on this server instance
    return out
