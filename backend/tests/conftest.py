import os
import sys
import tempfile

import pytest

# Isolated DB + uploads for the test run
_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["UPLOAD_DIR"] = f"{_tmp}/uploads"
os.environ["GEMINI_API_KEY"] = ""
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def guest(client):
    tok = client.post("/api/auth/guest").json()["token"]
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture
def member(client):
    """A registered user on the unlimited Gala Dinner plan (for tests that generate a lot)."""
    import uuid

    email = f"m{uuid.uuid4().hex[:8]}@example.com"
    tok = client.post("/api/auth/register", json={"name": "Member", "email": email, "password": "rahasia1"}).json()["token"]
    h = {"Authorization": f"Bearer {tok}"}
    client.post("/api/me/plan", json={"tier": "gala"}, headers=h)
    return h
