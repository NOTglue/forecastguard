def test_list_cases(client):
    response = client.get("/api/v1/cases")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["total"] >= 1
    first_case = data["cases"][0]
    assert "case_id" in first_case
    assert "title" in first_case
    assert "event_date" in first_case
    assert "synoptic_situation" in first_case
    assert "failure_mechanism" in first_case
    assert "lessons_learned" in first_case


def test_list_models(client):
    response = client.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["total"] >= 1
    first_model = data["models"][0]
    assert "model_id" in first_model
    assert "version" in first_model
    assert "architecture" in first_model
    assert "input_features" in first_model
    assert "forecast_horizons" in first_model
    # Scientific calibration flag should be False for demo models
    assert first_model["is_scientifically_calibrated"] is False
    assert "disclaimer" in first_model
