from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.database import Base, engine, get_db

# Create tables on startup (or when imported)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Share'N'Bite - Budget-first Recipe Generator, Financial Tracker & UGC Community for University Students"
)

# Enable CORS for React Native Web & Mobile Dev Servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "docs": "/docs"
    }


@app.get(f"{settings.API_V1_PREFIX}/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Test SQLite connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }
