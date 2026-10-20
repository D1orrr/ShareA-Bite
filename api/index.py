"""Vercel entry point: exposes the FastAPI app from backend/ as a serverless function."""
import os
import sys

# Ensure backend root is on sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# /tmp is the only writable folder on Vercel. It is wiped when the function goes cold,
# so the database is simply re-created and re-seeded (the demo account always exists).
if os.environ.get("VERCEL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/share_a_bite.db"

from app.main import app, init_db  # noqa: E402

# Serverless platforms don't always run FastAPI's startup (lifespan) hook, so make
# sure the tables and demo data exist as soon as the function is loaded.
init_db()

__all__ = ["app"]
