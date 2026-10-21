def test_health_check_exact_structure(client):
    """
    Rule requirement:
    The /health endpoint must return:
    {"status": "healthy", "project": "ForecastGuard"}
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "healthy", "project": "ForecastGuard"}


def test_root_overview(client):
    """Root overview endpoint provides discovery and status metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"].startswith("ForecastGuard")
    assert data["status"] == "online"
    assert data["data_mode"] == "DEMO"
    assert "endpoints" in data
    assert data["docs_url"] == "/docs"


def test_openapi_schema(client):
    """Verify OpenAPI schema is served and contains valid path definitions."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "openapi" in schema
    assert "paths" in schema
    assert "/health" in schema["paths"]
    assert "/api/v1/forecast-runs" in schema["paths"]
    assert "/api/v1/regions/{region_id}/risk" in schema["paths"]
    assert "/api/v1/confidence-map" in schema["paths"]
