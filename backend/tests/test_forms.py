"""
==============================================================================
FinTrack — Pure Python HTML Form Handlers Test Suite
==============================================================================
Tests traditional HTML <form method="POST"> submissions:
1. Transaction creation (/transactions/create)
2. Transaction deletion (/transactions/delete/<tx_id>)
3. Goal creation and funding (/goals/create, /goals/contribute)
4. Budget setting (/budgets/create)
5. Account creation and balance transfers (/accounts/create, /accounts/transfer)
6. Root app.py initialization
==============================================================================
"""

import pytest
from database import Database
from app import create_app


@pytest.fixture
def client():
    db = Database(":memory:")
    test_app = create_app(db)
    test_app.config["TESTING"] = True
    with test_app.test_client() as c:
        yield c, db


def test_form_create_transaction(client):
    c, db = client
    res = c.post(
        "/transactions/create",
        data={
            "type": "expense",
            "amount": "650.00",
            "accountId": "acc-primary-bank",
            "categoryId": "cat-food",
            "payee": "Dominos Pizza",
            "date": "2023-10-31",
            "notes": "Team lunch",
        },
        follow_redirects=False,
    )
    # Should redirect (HTTP 302) back to transactions
    assert res.status_code == 302
    assert "/transactions" in res.location

    # Verify transaction in database
    txs = db.get_full_bootstrap()["transactions"]
    matching = [t for t in txs if t.get("merchant") == "Dominos Pizza" or t.get("payee") == "Dominos Pizza"]
    assert len(matching) == 1
    assert float(matching[0]["amount"]) == 650.0


def test_form_delete_transaction(client):
    c, db = client
    # First create one
    tx = db.add_transaction({
        "type": "expense",
        "amount": 200,
        "accountId": "acc-primary-bank",
        "date": "2023-10-31",
        "payee": "Temp Tx",
    })
    tx_id = tx["id"]

    res = c.get(f"/transactions/delete/{tx_id}", follow_redirects=False)
    assert res.status_code == 302

    # Verify deleted
    txs = db.get_full_bootstrap()["transactions"]
    assert all(t["id"] != tx_id for t in txs)


def test_form_create_goal_and_contribute(client):
    c, db = client
    # 1. Create goal
    res1 = c.post(
        "/goals/create",
        data={
            "name": "MacBook Pro",
            "subtitle": "Work Laptop",
            "targetAmount": "150000",
            "savedAmount": "25000",
            "accountId": "acc-primary-bank",
        },
        follow_redirects=False,
    )
    assert res1.status_code == 302

    goals = db.get_full_bootstrap()["goals"]
    matching = [g for g in goals if g["name"] == "MacBook Pro"]
    assert len(matching) == 1
    goal_id = matching[0]["id"]

    # 2. Contribute to goal
    res2 = c.post(
        "/goals/contribute",
        data={
            "goalId": goal_id,
            "amount": "5000",
            "accountId": "acc-primary-bank",
        },
        follow_redirects=False,
    )
    assert res2.status_code == 302

    updated_goals = db.get_full_bootstrap()["goals"]
    updated = next(g for g in updated_goals if g["id"] == goal_id)
    assert float(updated["savedAmount"]) == 30000.0


def test_form_create_budget(client):
    c, db = client
    res = c.post(
        "/budgets/create",
        data={
            "categoryId": "cat-food",
            "monthlyLimit": "12000",
        },
        follow_redirects=False,
    )
    assert res.status_code == 302

    budgets = db.get_full_bootstrap()["budgets"]
    matching = [b for b in budgets if b["categoryId"] == "cat-food"]
    assert len(matching) == 1
    assert float(matching[0]["monthlyLimit"]) == 12000.0


def test_form_create_account_and_transfer(client):
    c, db = client
    # 1. Create Account
    res1 = c.post(
        "/accounts/create",
        data={
            "name": "Kotak 811",
            "type": "bank",
            "openingBalance": "10000",
            "accountNumber": "..8110",
        },
        follow_redirects=False,
    )
    assert res1.status_code == 302

    accounts = db.get_full_bootstrap()["accounts"]
    kotak = next((a for a in accounts if a["name"] == "Kotak 811"), None)
    assert kotak is not None

    # 2. Transfer between accounts
    primary = next(a for a in accounts if a["id"] == "acc-primary-bank")
    initial_primary_bal = float(primary["openingBalance"])

    res2 = c.post(
        "/accounts/transfer",
        data={
            "fromAccountId": "acc-primary-bank",
            "toAccountId": kotak["id"],
            "amount": "2000",
        },
        follow_redirects=False,
    )
    assert res2.status_code == 302

    txs = db.get_full_bootstrap()["transactions"]
    transfer_tx = next((t for t in txs if t["type"] == "transfer" and t.get("toAccountId") == kotak["id"]), None)
    assert transfer_tx is not None
    assert float(transfer_tx["amount"]) == 2000.0
    assert transfer_tx["accountId"] == "acc-primary-bank"
