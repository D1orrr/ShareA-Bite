"""Vercel entry point: exposes the FastAPI app from backend/ as a serverless function."""
import os
import sys

# Ensure backend root is on sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Database on Vercel:
#  - If a Postgres database is connected (Vercel Storage → Neon sets DATABASE_URL /
#    POSTGRES_URL), use it: one shared database for every server instance.
#  - Otherwise fall back to SQLite in /tmp (each instance has its own copy and it is
#    wiped when the function goes cold, so only good for a quick look).
if os.environ.get("VERCEL"):
    pg = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
    os.environ["DATABASE_URL"] = pg if pg and pg.startswith("postgres") else "sqlite:////tmp/share_a_bite.db"

from app.main import app, init_db  # noqa: E402

# Serverless platforms don't always run FastAPI's startup (lifespan) hook, so make
# sure the tables and demo data exist as soon as the function is loaded.
init_db()

__all__ = ["app"]
