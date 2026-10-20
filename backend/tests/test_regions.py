def test_list_regions(client):
    response = client.get("/api/v1/regions")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["total"] == 4
    region_ids = [r["region_id"] for r in data["regions"]]
    assert "ODISHA-07" in region_ids
    assert "KONKAN-23" in region_ids
    assert "GANGA-10" in region_ids
    assert "DECCAN-31" in region_ids


def test_get_region_detail(client):
    response = client.get("/api/v1/regions/ODISHA-07")
    assert response.status_code == 200
    data = response.json()
    assert data["region_id"] == "ODISHA-07"
    assert data["latitude"] == 20.3
    assert data["longitude"] == 85.8
    assert data["radar_radius_meters"] > 0


def test_get_region_risk(client):
    response = client.get("/api/v1/regions/ODISHA-07/risk")
    assert response.status_code == 200
    risk = response.json()
    assert risk["data_mode"] == "DEMO"
    assert risk["region_id"] == "ODISHA-07"
    # Probabilities must strictly remain between 0 and 1
    assert 0.0 <= risk["bust_probability"] <= 1.0
    assert 0.0 <= risk["confidence_score"] <= 1.0
    assert risk["risk_level"] in ["LOW", "MODERATE", "HIGH", "SEVERE"]
    # Check computed delta
    assert risk["bias_delta_mm"] == round(risk["corrected_precipitation_mm"] - risk["raw_precipitation_mm"], 1)
    # Check exceedances
    ex = risk["exceedance_probabilities"]
    assert 0.0 <= ex["heavy_rain_gt_64_5mm"] <= 1.0
    assert 0.0 <= ex["very_heavy_rain_gt_115_5mm"] <= 1.0
    assert 0.0 <= ex["extremely_heavy_rain_gt_204_5mm"] <= 1.0


def test_get_region_explanations(client):
    response = client.get("/api/v1/regions/ODISHA-07/explanations")
    assert response.status_code == 200
    exp = response.json()
    assert exp["data_mode"] == "DEMO"
    assert exp["region_id"] == "ODISHA-07"
    assert "primary_driver" in exp
    assert len(exp["key_factors"]) >= 1
    assert "recommended_action" in exp
    assert "disclaimer" in exp

    factor = exp["key_factors"][0]
    assert 0.0 <= factor["contribution_score"] <= 1.0
    assert "factor_name" in factor


def test_region_not_found_handling(client):
    for path in [
        "/api/v1/regions/NON_EXISTENT",
        "/api/v1/regions/NON_EXISTENT/risk",
        "/api/v1/regions/NON_EXISTENT/explanations",
    ]:
        res = client.get(path)
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()
