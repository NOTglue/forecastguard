def test_list_forecast_runs(client):
    response = client.get("/api/v1/forecast-runs")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["total"] >= 1
    assert len(data["runs"]) >= 1

    first_run = data["runs"][0]
    assert "run_id" in first_run
    assert "model_name" in first_run
    assert "model_version" in first_run
    assert "forecast_horizon_hours" in first_run
    assert "status" in first_run
    assert "data_source" in first_run


def test_get_latest_forecast_run(client):
    response = client.get("/api/v1/forecast-runs/latest")
    assert response.status_code == 200
    run = response.json()
    assert run["data_mode"] == "DEMO"
    assert run["status"] == "ACTIVE"
    assert run["forecast_horizon_hours"] > 0
    assert "run_id" in run


def test_get_forecast_run_by_id(client):
    response = client.get("/api/v1/forecast-runs/RUN-20261020-00Z")
    assert response.status_code == 200
    run = response.json()
    assert run["run_id"] == "RUN-20261020-00Z"


def test_get_forecast_run_by_invalid_id(client):
    response = client.get("/api/v1/forecast-runs/UNKNOWN_RUN_XYZ")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
