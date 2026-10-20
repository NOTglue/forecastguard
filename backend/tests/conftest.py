import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
TEST_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(TEST_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Session-wide test client fixture."""
    with TestClient(app) as test_client:
        yield test_client
