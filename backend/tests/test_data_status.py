def test_data_status(client):
    response = client.get("/api/v1/data-status")
    assert response.status_code == 200
    data = response.json()
    assert data["data_mode"] == "DEMO"
    assert data["is_real_data"] is False
    assert data["is_demonstration"] is True
    assert "data_source" in data
    assert "last_updated" in data
    assert data["data_freshness_seconds"] >= 0
    assert "upstream_sources" in data
    assert len(data["upstream_sources"]) >= 1
    assert "system_notice" in data
