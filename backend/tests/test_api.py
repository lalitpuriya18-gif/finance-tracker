"""
Integration tests for FinTrack Flask REST API.
"""

import pytest
from backend.app import create_app
from backend.database import Database


@pytest.fixture
def client():
    # In-memory DB passed to Flask app
    db = Database(":memory:")
    app = create_app(db)
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert "sqlite" in data["database"]


def test_bootstrap_endpoint(client):
    res = client.get("/api/bootstrap")
    assert res.status_code == 200
    data = res.get_json()
    assert "accounts" in data
    assert "categories" in data
    assert "transactions" in data
    assert "settings" in data
    assert len(data["accounts"]) == 4


def test_transactions_api_lifecycle(client):
    # 1. Validation failure
    bad_res = client.post("/api/transactions", json={"note": "Incomplete"})
    assert bad_res.status_code == 400

    # 2. Create valid transaction
    tx_payload = {
        "type": "expense",
        "amount": 250000,
        "categoryId": "cat-food",
        "accountId": "acc-primary-bank",
        "date": "2026-10-30",
        "note": "Grocery delivery",
        "tags": ["groceries"],
    }
    create_res = client.post("/api/transactions", json=tx_payload)
    assert create_res.status_code == 201
    created = create_res.get_json()
    tx_id = created["id"]
    assert tx_id is not None
    assert created["amount"] == 250000

    # 3. List
    list_res = client.get("/api/transactions")
    assert list_res.status_code == 200
    txs = list_res.get_json()
    assert len(txs) == 1
    assert txs[0]["id"] == tx_id

    # 4. Update
    update_res = client.put(f"/api/transactions/{tx_id}", json={"amount": 300000, "note": "Updated Grocery"})
    assert update_res.status_code == 200
    assert update_res.get_json()["amount"] == 300000

    # 5. Delete
    del_res = client.delete(f"/api/transactions/{tx_id}")
    assert del_res.status_code == 200
    assert del_res.get_json()["success"] is True

    # 6. Verify empty
    assert len(client.get("/api/transactions").get_json()) == 0


def test_accounts_and_transfer_api(client):
    # Create account
    res = client.post("/api/accounts", json={"name": "HDFC Savings", "type": "bank", "openingBalance": 1000000})
    assert res.status_code == 201
    acc_id = res.get_json()["id"]

    # Transfer
    transfer_res = client.post("/api/accounts/transfer", json={
        "fromAccountId": "acc-primary-bank",
        "toAccountId": acc_id,
        "amount": 50000,
        "note": "Inter-account transfer",
    })
    assert transfer_res.status_code == 201
    tx = transfer_res.get_json()
    assert tx["type"] == "transfer"
    assert tx["toAccountId"] == acc_id


def test_categories_api(client):
    res = client.post("/api/categories", json={"name": "Freelance", "icon": "DollarSign", "color": "#10b981", "type": "income"})
    assert res.status_code == 201
    cat_id = res.get_json()["id"]

    update_res = client.put(f"/api/categories/{cat_id}", json={"name": "Consulting & Freelance"})
    assert update_res.status_code == 200
    assert update_res.get_json()["name"] == "Consulting & Freelance"

    del_res = client.delete(f"/api/categories/{cat_id}")
    assert del_res.status_code == 200


def test_budgets_api(client):
    res = client.post("/api/budgets", json={"categoryId": "cat-food", "monthlyLimit": 1500000})
    assert res.status_code == 200
    b = res.get_json()
    assert b["monthlyLimit"] == 1500000

    del_res = client.delete(f"/api/budgets/{b['id']}")
    assert del_res.status_code == 200


def test_goals_api_and_contribution(client):
    # Create goal
    create_res = client.post("/api/goals", json={
        "name": "Japan Trip",
        "targetAmount": 30000000,
        "savedAmount": 10000000,
        "targetDate": "2027-04-15",
    })
    assert create_res.status_code == 201
    goal = create_res.get_json()
    goal_id = goal["id"]

    # Contribute
    contrib_res = client.post(f"/api/goals/{goal_id}/contribute", json={
        "amount": 5000000,
        "accountId": "acc-primary-bank",
    })
    assert contrib_res.status_code == 200
    assert contrib_res.get_json()["savedAmount"] == 15000000


def test_settings_and_sync_api(client):
    # Update settings
    res = client.put("/api/settings", json={"userName": "Aarav Gupta", "theme": "dark"})
    assert res.status_code == 200
    assert res.get_json()["userName"] == "Aarav Gupta"
    assert res.get_json()["theme"] == "dark"

    # Sync
    sync_res = client.post("/api/sync")
    assert sync_res.status_code == 200
    assert sync_res.get_json()["status"] == "success"


def test_auth_api(client):
    # Login via API
    login_res = client.post("/api/auth/login", json={
        "email": "arjun@fintrack.io",
        "name": "Arjun Mehta",
    })
    assert login_res.status_code == 200
    data = login_res.get_json()
    assert data["success"] is True
    assert data["user"]["userName"] == "Arjun Mehta"
    assert data["user"]["userEmail"] == "arjun@fintrack.io"

    # Google Auth simulation
    google_res = client.post("/api/auth/google", json={
        "name": "Arjun Google",
        "email": "arjun.g@gmail.com",
    })
    assert google_res.status_code == 200
    assert google_res.get_json()["user"]["userName"] == "Arjun Google"

    # Logout
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200
    assert logout_res.get_json()["success"] is True

