import pytest
from fastapi.testclient import TestClient
from main import app, load_prediction_model

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_model():
    load_prediction_model()

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "smartpark-ml-service"

def test_ready_endpoint():
    res = client.get("/ready")
    assert res.status_code == 200
    data = res.json()
    assert data["ready"] is True
    assert data["model_loaded"] is True

def test_models_metadata_endpoint():
    res = client.get("/models/metadata")
    assert res.status_code == 200
    data = res.json()
    assert "evaluation_metrics" in data
    assert "model_mae_percentage" in data["evaluation_metrics"]
    assert data["evaluation_metrics"]["model_mae_percentage"] <= 5.0

def test_predict_endpoint_valid():
    payload = {
        "facility_id": "fac_tech_center",
        "facility_capacity": 500,
        "current_occupancy": 300,
        "horizons_minutes": [15, 30, 45, 60]
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["facility_id"] == "fac_tech_center"
    assert data["facility_capacity"] == 500
    assert len(data["forecast_points"]) == 4

    for point in data["forecast_points"]:
        # Verify occupancy bounds
        assert 0.0 <= point["predicted_occupancy_percentage"] <= 100.0
        # Verify available spaces match capacity
        assert point["predicted_occupied_spaces"] + point["predicted_available_spaces"] == 500
        # Verify confidence interval bounds
        assert point["confidence_lower"] <= point["predicted_occupancy_percentage"] <= point["confidence_upper"]

    assert data["trend_direction"] in ["increasing", "decreasing", "stable"]
    assert len(data["trend_explanation"]) > 0

def test_predict_occupancy_exceeds_capacity_error():
    payload = {
        "facility_id": "fac_invalid",
        "facility_capacity": 100,
        "current_occupancy": 150, # invalid!
        "horizons_minutes": [15]
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 400
    assert "cannot exceed" in res.json()["detail"]

def test_predict_batch():
    batch_payload = {
        "requests": [
            {
                "facility_id": "fac_1",
                "facility_capacity": 200,
                "current_occupancy": 50,
                "horizons_minutes": [15, 30]
            },
            {
                "facility_id": "fac_2",
                "facility_capacity": 1000,
                "current_occupancy": 800,
                "horizons_minutes": [15, 30]
            }
        ]
    }
    res = client.post("/predict/batch", json=batch_payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["facility_id"] == "fac_1"
    assert data[1]["facility_id"] == "fac_2"
