"""
==============================================================================
FinTrack — Frontend Web Page Integration Tests
==============================================================================
Verifies that all semantic HTML5 web pages served by Flask load successfully
(HTTP 200) and render expected UI components, tables, buttons, and navigation.
==============================================================================
"""

import pytest
from backend.database import Database
from backend.app import create_app


@pytest.fixture
def client():
    """Initializes an isolated in-memory test database and Flask test client."""
    db = Database(":memory:")
    app = create_app(db)
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_page_dashboard(client):
    """Verifies that the root / URL renders the dashboard with metrics and cards."""
    res = client.get("/")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "FinTrack" in html
    assert "Welcome back" in html
    assert "Total Net Worth" in html
    assert "Monthly Inflow" in html
    assert "Monthly Outflow" in html
    assert "Recent Transactions" in html


def test_page_transactions(client):
    """Verifies that /transactions renders the ledger table, filters, and CSV export."""
    res = client.get("/transactions")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Transactions Ledger" in html
    assert "Export CSV" in html
    assert "transactionSearchInput" in html
    assert "categoryFilterSelect" in html
    assert "transactionsTable" in html


def test_page_budgets(client):
    """Verifies that /budgets renders category budgets and progress cards."""
    res = client.get("/budgets")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Monthly Budgets" in html
    assert "Create Budget" in html
    assert "addBudgetModal" in html


def test_page_goals(client):
    """Verifies that /goals renders savings milestones and standing mandates."""
    res = client.get("/goals")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Financial Goals" in html
    assert "Active Savings Milestones" in html
    assert "Standing Mandates" in html
    assert "addGoalModal" in html


def test_page_reports(client):
    """Verifies that /reports renders executive analytics and printable reports."""
    res = client.get("/reports")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Executive Financial Reports" in html
    assert "Cumulative Inflow" in html
    assert "Category Spending Distribution" in html


def test_page_accounts(client):
    """Verifies that /accounts renders bank account cards and transfer modals."""
    res = client.get("/accounts")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Bank & Card Accounts" in html
    assert "Transfer Money" in html
    assert "addAccountModal" in html
    assert "transferModal" in html


def test_page_settings(client):
    """Verifies that /settings renders user preferences and data management controls."""
    res = client.get("/settings")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "System Settings & Data Controls" in html
    assert "settingCurrency" in html
    assert "Reset to Demo Data" in html
    assert "Clear All Data" in html
