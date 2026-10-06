import sys
import os

# Ensure backend root is on sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Ensure /tmp writable database on Vercel Serverless
if os.environ.get("VERCEL"):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/share_n_bite.db"

from app.main import app
