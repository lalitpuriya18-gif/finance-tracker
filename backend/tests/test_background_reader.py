"""
==============================================================================
FinTrack — Automated Background SMS Webhook Test Suite
==============================================================================
Unit and integration tests for:
1. Local IP resolution helper (get_local_ip)
2. Webhook status checking (GET /api/webhook/sms/status)
3. Background SMS alert ingestion (POST /api/webhook/sms)
4. Duplicate transaction prevention
5. Non-transaction message filtering (OTP / promo skips)
6. Live SMS webhook simulation (POST /api/webhook/sms/test)
==============================================================================
"""

import pytest
from backend.database import Database
from backend.app import create_app, get_local_ip


@pytest.fixture
def client():
    """Isolated test client with in-memory SQLite database."""
    db = Database(":memory:")
    app = create_app(db)
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_get_local_ip():
    """Verifies that get_local_ip returns a non-empty, valid IP format."""
    ip = get_local_ip()
    assert isinstance(ip, str)
    assert len(ip) >= 7  # Shortest IP like "1.1.1.1"
    parts = ip.split(".")
    assert len(parts) == 4
    for part in parts:
        assert part.isdigit()
        assert 0 <= int(part) <= 255


def test_api_webhook_sms_status(client):
    """Verifies GET /api/webhook/sms/status returns active state and webhook URL."""
    res = client.get("/api/webhook/sms/status")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "active"
    assert "local_ip" in data
    assert "webhook_url" in data
    assert "/api/webhook/sms" in data["webhook_url"]


def test_api_webhook_empty_payload(client):
    """Verifies POST /api/webhook/sms rejects empty body with 400."""
    res = client.post("/api/webhook/sms", json={"text": ""})
    assert res.status_code == 400
    data = res.get_json()
    assert data["status"] == "ignored"


def test_api_webhook_non_transaction_message(client):
    """Verifies OTP and marketing messages are safely skipped without error."""
    otp_msg = "Your FinTrack verification code is 849201. Valid for 10 minutes. Do not share."
    res = client.post("/api/webhook/sms", json={"text": otp_msg})
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "skipped"


def test_api_webhook_valid_bank_alert(client):
    """Verifies incoming bank SMS creates a new transaction in SQLite."""
    sms = "Sent Rs.450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. UPI Ref 329012345678."
    res = client.post("/api/webhook/sms", json={"text": sms})
    assert res.status_code == 201
    data = res.get_json()
    assert data["status"] == "recorded"
    assert data["count"] == 1
    imported = data["imported"][0]
    assert float(imported["amount"]) == 450.0
    assert "Swiggy" in imported["payee"]
    assert imported["categoryId"] == "cat-food"

    # Verify transaction is recorded in SQLite ledger
    bootstrap = client.get("/api/bootstrap").get_json()
    txs = bootstrap["transactions"]
    matching = [t for t in txs if float(t["amount"]) == 450.0]
    assert len(matching) >= 1


def test_api_webhook_duplicate_prevention(client):
    """Verifies duplicate incoming notifications are ignored without double-charging."""
    sms = "INR 380 debited from A/C *8921 at UBER INDIA on 29-OCT-23. UPI Ref 99887766."
    
    # First delivery
    res1 = client.post("/api/webhook/sms", json={"text": sms})
    assert res1.status_code == 201
    data1 = res1.get_json()
    assert data1["status"] == "recorded"

    # Second delivery of identical alert
    res2 = client.post("/api/webhook/sms", json={"text": sms})
    assert res2.status_code == 200
    data2 = res2.get_json()
    assert data2["status"] == "duplicate"
    assert data2["count"] == 0


def test_api_webhook_form_and_plain_text(client):
    """Verifies webhook handles form-encoded and raw plain text payloads."""
    # 1. Form-encoded
    res_form = client.post(
        "/api/webhook/sms",
        data={"body": "Sent Rs.1200.00 to AMAZON on 28-OCT-23 from A/C *8921"}
    )
    assert res_form.status_code == 201
    data_form = res_form.get_json()
    assert data_form["status"] == "recorded"

    # 2. Plain text
    res_raw = client.post(
        "/api/webhook/sms",
        data="Rs 85,000 credited to A/C *8921 as SALARY on 25-OCT-23",
        headers={"Content-Type": "text/plain"}
    )
    assert res_raw.status_code == 201
    data_raw = res_raw.get_json()
    assert data_raw["status"] == "recorded"
    assert data_raw["imported"][0]["type"] == "income"


def test_api_webhook_test_simulation_endpoint(client):
    """Verifies POST /api/webhook/sms/test triggers a live simulated bank transaction."""
    res = client.post("/api/webhook/sms/test", json={})
    assert res.status_code in (200, 201)
    data = res.get_json()
    assert data["status"] in ("recorded", "duplicate")
