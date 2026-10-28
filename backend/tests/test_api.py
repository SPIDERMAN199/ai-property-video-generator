import os
import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.models.project import SessionLocal, Project, RenderJob

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["ffmpeg_available"] is True

def test_dashboard_stats():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_projects" in data
    assert "completed_videos" in data

def test_project_crud():
    payload = {
        "name": "Emerald Heights",
        "location": "Sector 62, Gurgaon",
        "price": 12500000.0,
        "property_type": "Apartment",
        "bedrooms": 3,
        "bathrooms": 3,
        "area": 1850.0,
        "area_unit": "sq ft",
        "key_features": ["Clubhouse", "Infinity Pool", "Modular Kitchen"],
        "cta_text": "Schedule your VIP tour today"
    }
    create_res = client.post("/api/projects", json=payload)
    assert create_res.status_code == 201
    proj_data = create_res.json()
    assert proj_data["name"] == "Emerald Heights"
    assert "₹1.25 Cr" in proj_data["price_formatted"] or "1.25" in proj_data["price_formatted"]
    proj_id = proj_data["id"]

    # Read
    get_res = client.get(f"/api/projects/{proj_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proj_id

    # Update
    update_res = client.put(f"/api/projects/{proj_id}", json={"name": "Emerald Heights Luxury"})
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Emerald Heights Luxury"

    # Delete
    del_res = client.delete(f"/api/projects/{proj_id}")
    assert del_res.status_code == 204

def test_image_upload_validation():
    # Create temp project
    proj_res = client.post("/api/projects", json={
        "name": "Test Residency",
        "location": "Mumbai",
        "price": 5000000.0,
        "property_type": "Apartment"
    })
    proj_id = proj_res.json()["id"]

    # Test invalid extension
    fake_txt = io.BytesIO(b"Not an image")
    bad_res = client.post(
        f"/api/projects/{proj_id}/images",
        files=[("files", ("test.txt", fake_txt, "text/plain"))]
    )
    assert bad_res.status_code == 400
    assert "Unsupported format" in bad_res.json()["detail"]

    # Test valid image
    img_buf = io.BytesIO()
    Image.new("RGB", (800, 600), (40, 80, 120)).save(img_buf, format="JPEG")
    img_buf.seek(0)
    good_res = client.post(
        f"/api/projects/{proj_id}/images",
        files=[("files", ("test_photo.jpg", img_buf, "image/jpeg"))]
    )
    assert good_res.status_code == 201
    assert len(good_res.json()) == 1

    # Cleanup
    client.delete(f"/api/projects/{proj_id}")

def test_sample_loader_and_storyboard():
    res = client.post("/api/projects/sample/load")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Skyline Residency"
    assert len(data["images"]) >= 4
    assert data["script"] is not None
    assert len(data["storyboard"]) >= 4

def test_render_and_download_pipeline():
    # Load sample project
    sample_res = client.post("/api/projects/sample/load")
    proj_id = sample_res.json()["id"]

    # Trigger render
    render_payload = {
        "aspect_ratio": "9:16",
        "resolution": "720p",
        "duration_preset": "20s",
        "template": "luxury",
        "include_music": True,
        "music_volume": 0.25,
        "include_narration": False  # Fast unit test render
    }
    start_res = client.post(f"/api/projects/{proj_id}/render", json=render_payload)
    assert start_res.status_code in [200, 202]
    job_id = start_res.json()["id"]

    # Wait for completion (timeout 30s)
    import time
    completed = False
    for _ in range(30):
        time.sleep(1)
        status_res = client.get(f"/api/renders/{job_id}")
        st = status_res.json()["status"]
        if st == "completed":
            completed = True
            break
        elif st == "failed":
            pytest.fail(f"Render failed: {status_res.json().get('error_message')}")

    assert completed is True
    render_data = status_res.json()
    assert render_data["progress"] == 100
    assert render_data["file_size_bytes"] > 5000

    # Download verification
    dl_res = client.get(f"/api/renders/{job_id}/download")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "video/mp4"
    assert len(dl_res.content) > 5000
