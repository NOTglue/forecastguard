def test_export_regions_csv(client):
    response = client.get("/api/v1/exports/regions.csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "attachment" in response.headers.get("content-disposition", "")
    assert "forecastguard_regions.csv" in response.headers.get("content-disposition", "")

    content = response.text
    lines = content.strip().split("\n")
    assert len(lines) >= 5  # Header + 4 regions
    header = lines[0].split(",")
    assert "region_id" in header
    assert "region_name" in header
    assert "raw_precipitation_mm" in header
    assert "corrected_precipitation_mm" in header
    assert "bust_probability" in header
    assert "risk_level" in header
    assert "data_mode" in header
