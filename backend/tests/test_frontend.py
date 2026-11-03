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


def test_page_login_get(client):
    """Verifies that GET /login renders the FinTrack login page."""
    res = client.get("/login")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Fintrack" in html
    assert "Welcome back" in html
    assert "Arjun Mehta" in html
    assert "Sign In to FinTrack" in html


def test_page_login_post(client):
    """Verifies that POST /login authenticates the user and redirects to dashboard."""
    res = client.post("/login", data={
        "email": "arjun@fintrack.io",
        "password": "password123",
        "name": "Arjun Mehta",
    }, follow_redirects=True)
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Welcome back" in html
    assert "Arjun Mehta" in html


def test_page_logout(client):
    """Verifies that GET /logout clears session and redirects to /login."""
    res = client.get("/logout", follow_redirects=True)
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Sign In" in html


def test_page_quick_login(client):
    """Verifies one-click demo login matching screenshot (Arjun Mehta) and custom demo."""
    res = client.post("/quick-login", follow_redirects=True)
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Arjun Mehta" in html

    # Also supports explicit user
    res_lalit = client.post("/quick-login", data={"email": "lalitpuriya@gmail.com"}, follow_redirects=True)
    assert res_lalit.status_code == 200
    assert "Lalit Puriya" in res_lalit.get_data(as_text=True)



def test_page_register_and_forgot_password(client):
    """Verifies account creation and password recovery through pure HTML forms."""
    # Register
    reg_res = client.post("/register", data={
        "name": "Sameer Joshi",
        "email": "sameer@domain.com",
        "password": "secretPassword1",
    }, follow_redirects=True)
    assert reg_res.status_code == 200
    assert "Sameer Joshi" in reg_res.get_data(as_text=True)

    # Logout
    client.get("/logout")

    # Reset password
    reset_res = client.post("/forgot-password", data={
        "email": "sameer@domain.com",
        "new_password": "newPassword99",
    })
    assert reset_res.status_code == 200
    assert "Password for sameer@domain.com reset successfully" in reset_res.get_data(as_text=True)

    # Login with new password
    login_res = client.post("/login", data={
        "email": "sameer@domain.com",
        "password": "newPassword99",
    }, follow_redirects=True)
    assert login_res.status_code == 200
    assert "Sameer Joshi" in login_res.get_data(as_text=True)


def test_google_auth_chooser_and_custom_email_login_signup(client):
    """Verifies that Google auth renders account chooser and connects chosen email to SQLite."""
    # 1. GET /auth/google displays Google Account Chooser screen with stored users
    res = client.get("/auth/google")
    assert res.status_code == 200
    html = res.get_data(as_text=True)
    assert "Choose an account" in html
    assert "FinTrack" in html
    assert "Arjun Mehta" in html
    assert "Use another Google account" in html

    # 2. Select existing Google account (e.g. Lalit Puriya)
    login_existing = client.post("/auth/google", data={
        "email": "lalitpuriya@gmail.com",
        "name": "Lalit Puriya",
    }, follow_redirects=True)
    assert login_existing.status_code == 200
    assert "Lalit Puriya" in login_existing.get_data(as_text=True)

    # 3. Choose a brand new Google email to sign up in SQLite
    new_email = "rohit.sharma@gmail.com"
    signup_google = client.post("/auth/google", data={
        "email": new_email,
        "name": "Rohit Sharma",
    }, follow_redirects=True)
    assert signup_google.status_code == 200
    assert "Rohit Sharma" in signup_google.get_data(as_text=True)

    # 4. Verify user was persisted into SQLite database
    users_api = client.get("/api/auth/users")
    assert users_api.status_code == 200
    all_users = users_api.get_json()["users"]
    user_emails = [u["email"] for u in all_users]
    assert new_email in user_emails


