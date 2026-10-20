def test_verification_summary(client):
    response = client.get("/api/v1/verification/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["is_simulated"] is True
    assert "verification_status" in data
    assert "disclaimer" in data
    metrics = data["metrics"]
    assert "raw_nwp_mae_mm" in metrics
    assert "ai_corrected_mae_mm" in metrics
    assert 0.0 <= metrics["bust_detection_precision"] <= 1.0
    assert 0.0 <= metrics["bust_detection_recall"] <= 1.0
    assert 0.0 <= metrics["critical_success_index"] <= 1.0


def test_verification_series(client):
    response = client.get("/api/v1/verification/series")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["is_simulated"] is True
    assert data["total_points"] == 10
    assert len(data["series"]) == 10

    # Historical days (1 to 5) should have observations
    for pt in data["series"][:5]:
        assert pt["observed_precipitation_mm"] is not None
        assert pt["observation_status"] == "VERIFIED_DEMO_RECORD"
        assert 0.0 <= pt["bust_risk_probability"] <= 1.0

    # Future lead days (6 to 10) must represent observations as unavailable/None
    for pt in data["series"][5:]:
        assert pt["observed_precipitation_mm"] is None
        assert pt["observation_status"] == "UNAVAILABLE_FUTURE_LEAD"
        assert 0.0 <= pt["bust_risk_probability"] <= 1.0
