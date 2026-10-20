def test_confidence_map(client):
    response = client.get("/api/v1/confidence-map")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["total_regions"] == 4
    assert len(data["regions"]) == 4

    # Check first region payload
    r0 = data["regions"][0]
    assert "region_id" in r0
    assert "coordinates" in r0
    assert len(r0["coordinates"]) == 2
    assert 0.0 <= r0["confidence_value"] <= 1.0
    assert 0.0 <= r0["bust_probability"] <= 1.0
    assert r0["risk_level"] in ["LOW", "MODERATE", "HIGH", "SEVERE"]
    assert "radius_meters" in r0
    assert r0["data_status"] == "SYNTHETIC_DEMO"

    # Check GeoJSON representation
    geojson = data["geojson"]
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) == 4
    f0 = geojson["features"][0]
    assert f0["type"] == "Feature"
    assert f0["geometry"]["type"] == "Point"
    assert len(f0["geometry"]["coordinates"]) == 2  # [lon, lat]

    # Check legend colors
    assert "legend_reference" in data
    assert "SEVERE" in data["legend_reference"]
    assert "LOW" in data["legend_reference"]
