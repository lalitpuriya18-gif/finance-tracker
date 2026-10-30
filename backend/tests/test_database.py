"""
Unit tests for FinTrack SQLite Database Layer.
"""

import pytest
from backend.database import Database, DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS


@pytest.fixture
def db():
    # Use isolated in-memory database for fast, hermetic tests
    return Database(":memory:")


def test_database_initialization(db):
    data = db.get_full_bootstrap()
    assert len(data["accounts"]) == len(DEFAULT_ACCOUNTS)
    assert len(data["categories"]) == len(DEFAULT_CATEGORIES)
    assert len(data["transactions"]) == 0
    assert len(data["budgets"]) == 0
    assert len(data["goals"]) == 0
    assert data["settings"]["currency"] == "INR"


def test_transaction_crud(db):
    # Add
    tx = db.add_transaction({
        "type": "expense",
        "amount": 150000,
        "categoryId": "cat-food",
        "accountId": "acc-primary-bank",
        "date": "2026-10-30",
        "note": "Lunch with team",
        "tags": ["food", "work"],
    })
    assert tx["id"].startswith("tx-")
    assert tx["amount"] == 150000

    # Retrieve via bootstrap
    data = db.get_full_bootstrap()
    assert len(data["transactions"]) == 1
    assert data["transactions"][0]["note"] == "Lunch with team"
    assert "food" in data["transactions"][0]["tags"]

    # Update
    updated = db.update_transaction(tx["id"], {"amount": 180000, "note": "Lunch & Coffee"})
    assert updated["amount"] == 180000
    assert updated["note"] == "Lunch & Coffee"

    # Delete
    deleted = db.delete_transaction(tx["id"])
    assert deleted is True

    data = db.get_full_bootstrap()
    assert len(data["transactions"]) == 0


def test_account_crud_and_transfer(db):
    # Add new account
    acc = db.add_account({
        "name": "Emergency Fund",
        "type": "bank",
        "openingBalance": 5000000,
        "accountNumber": "..7711",
        "color": "#10b981",
    })
    assert acc["id"].startswith("acc-")
    assert acc["openingBalance"] == 5000000

    # Transfer
    tx = db.transfer_between_accounts("acc-primary-bank", acc["id"], 100000, "Move to savings")
    assert tx["type"] == "transfer"
    assert tx["accountId"] == "acc-primary-bank"
    assert tx["toAccountId"] == acc["id"]
    assert tx["amount"] == 100000

    # Delete
    deleted = db.delete_account(acc["id"])
    assert deleted is True


def test_budget_operations(db):
    b = db.set_budget({"categoryId": "cat-food", "monthlyLimit": 2500000, "subtitle": "Dining budget"})
    assert b["monthlyLimit"] == 2500000

    data = db.get_full_bootstrap()
    assert len(data["budgets"]) == 1

    # Overwrite / update budget
    b2 = db.set_budget({"categoryId": "cat-food", "monthlyLimit": 3000000})
    assert b2["id"] == b["id"]
    assert b2["monthlyLimit"] == 3000000

    deleted = db.delete_budget(b["id"])
    assert deleted is True
    assert len(db.get_full_bootstrap()["budgets"]) == 0


def test_goal_and_contribution(db):
    goal = db.add_goal({
        "name": "MacBook Pro M3",
        "targetAmount": 20000000,
        "savedAmount": 5000000,
        "targetDate": "2026-12-31",
    })
    assert goal["savedAmount"] == 5000000

    # Contribute
    result = db.contribute_to_goal(goal["id"], 2500000, "acc-primary-bank")
    assert result["savedAmount"] == 7500000

    # Check auto-logged transaction
    data = db.get_full_bootstrap()
    assert len(data["transactions"]) == 1
    assert data["transactions"][0]["amount"] == 2500000
    assert "Goal Deposit" in data["transactions"][0]["note"]


def test_settings_and_clear_all(db):
    updated = db.update_settings({"userName": "Priya Sharma", "currency": "USD"})
    assert updated["userName"] == "Priya Sharma"
    assert updated["currency"] == "USD"

    # Add transaction then clear
    db.add_transaction({
        "type": "income",
        "amount": 1000000,
        "categoryId": "cat-income",
        "accountId": "acc-primary-bank",
        "date": "2026-10-30",
    })
    assert len(db.get_full_bootstrap()["transactions"]) == 1

    db.clear_all()
    fresh = db.get_full_bootstrap()
    assert len(fresh["transactions"]) == 0
    # Clean starter accounts and categories preserved
    assert len(fresh["accounts"]) == len(DEFAULT_ACCOUNTS)
    assert len(fresh["categories"]) == len(DEFAULT_CATEGORIES)
