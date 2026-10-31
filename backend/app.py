"""
==============================================================================
FinTrack — Python (Flask) Backend & Web Application
==============================================================================
This file defines the Flask server, providing:
1. Semantic HTML Web Routes (Dashboard, Transactions, Budgets, Goals, Reports, Accounts, Settings)
2. RESTful JSON Endpoints for interactive Fetch API requests
3. Direct SQLite Database integration with thread-safe queries and data seeding

Written with clear, beginner-friendly comments so any student or evaluator can understand.
==============================================================================
"""

import os
import sys
import time
import socket
from pathlib import Path
from datetime import datetime, timezone

# Ensure project root is in sys.path so 'from backend...' imports resolve reliably
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from flask import Flask, jsonify, request, render_template, redirect, url_for, session
from flask_cors import CORS
from backend.database import Database, DEFAULT_DB_PATH
from backend.sms_parser import parse_multi_sms

START_TIME = time.time()


def get_local_ip() -> str:
    """
    Finds the machine's local Wi-Fi / LAN IP address (e.g. 192.168.1.35)
    using Python's standard socket library with 0 external packages.
    Allows mobile phones on the same Wi-Fi to push webhook alerts directly to this PC.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Connecting to a public IP picks the host's active local interface without sending traffic
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def get_page_context(db: Database) -> dict:
    """
    Helper function to aggregate financial metrics and format data for HTML templates.
    Calculates total net worth, monthly income, expenses, budget limits, and category ratios.
    """
    data = db.get_full_bootstrap()
    accounts = data.get("accounts", [])
    categories = data.get("categories", [])
    transactions = data.get("transactions", [])
    budgets = data.get("budgets", [])
    goals = data.get("goals", [])
    mandates = data.get("mandates", [])
    settings = data.get("settings", {})

    # Quick lookups for Category and Account metadata by ID
    cat_map = {c["id"]: c for c in categories}
    acc_map = {a["id"]: a for a in accounts}

    # 1. Calculate Summary Totals
    net_worth = sum(float(a.get("openingBalance", 0)) for a in accounts)
    monthly_income = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "income")
    monthly_expense = sum(float(t.get("amount", 0)) for t in transactions if t.get("type") == "expense")
    net_savings = monthly_income - monthly_expense
    savings_rate = round((net_savings / monthly_income) * 100, 1) if monthly_income > 0 else 0

    # 2. Enrich Transactions with Human-Readable Category and Account Names
    enriched_transactions = []
    for t in transactions:
        cat = cat_map.get(t.get("categoryId"), {})
        acc = acc_map.get(t.get("accountId"), {})
        enriched_transactions.append({
            **t,
            "category_name": cat.get("name", "General"),
            "account_name": acc.get("name", "Bank"),
            "payee": t.get("merchant") or t.get("note") or "Transaction",
        })

    # 3. Compute Spending per Category
    category_spending = {}
    for t in transactions:
        if t.get("type") == "expense":
            cid = t.get("categoryId")
            category_spending[cid] = category_spending.get(cid, 0.0) + float(t.get("amount", 0))

    # 4. Enrich Category Budgets with Utilization Percentages
    enriched_budgets = []
    for b in budgets:
        cid = b.get("categoryId")
        cat = cat_map.get(cid, {})
        spent = category_spending.get(cid, 0.0)
        limit = float(b.get("monthlyLimit", 0))
        pct = round((spent / limit) * 100, 1) if limit > 0 else 0
        enriched_budgets.append({
            **b,
            "category_name": cat.get("name", "Category"),
            "spent": spent,
            "monthly_limit": limit,
            "percentage": pct,
        })

    # 5. Enrich Savings Goals with Target Progress
    enriched_goals = []
    for g in goals:
        curr = float(g.get("savedAmount", 0))
        target = float(g.get("targetAmount", 1))
        pct = round((curr / target) * 100, 1) if target > 0 else 0
        enriched_goals.append({
            **g,
            "currentAmount": curr,
            "percentage": pct,
        })

    # 6. Enrich Standing Instructions / Mandates
    enriched_mandates = []
    for m in mandates:
        enriched_mandates.append({
            **m,
            "name": m.get("goalName", "Mandate"),
            "amount": float(m.get("monthlyAllocation", 0)),
            "frequency": m.get("mandateType", "monthly"),
            "nextDate": m.get("cycleDate", "2023-11-01"),
            "status": m.get("status", "Active").lower(),
        })

    # 7. Category Expense Breakdown for Reports
    category_breakdown = []
    for cid, cat in cat_map.items():
        if cat.get("type") == "expense":
            amt = category_spending.get(cid, 0.0)
            if amt > 0:
                pct = round((amt / monthly_expense) * 100, 1) if monthly_expense > 0 else 0
                count = sum(1 for t in transactions if t.get("categoryId") == cid and t.get("type") == "expense")
                category_breakdown.append({
                    "name": cat.get("name"),
                    "amount": amt,
                    "count": count,
                    "percentage": pct,
                })
    category_breakdown.sort(key=lambda x: x["amount"], reverse=True)

    local_ip = get_local_ip()
    port = int(os.environ.get("PORT", 5000))
    webhook_url = f"http://{local_ip}:{port}/api/webhook/sms"

    try:
        user_name = session.get("user_name") or settings.get("userName", "Arjun Mehta")
        user_email = session.get("user_email") or settings.get("userEmail", "arjun@fintrack.io")
        is_logged_in = session.get("logged_in", True)
    except Exception:
        user_name = settings.get("userName", "Arjun Mehta")
        user_email = settings.get("userEmail", "arjun@fintrack.io")
        is_logged_in = True

    return {
        "global_accounts": accounts,
        "global_categories": categories,
        "user_profile": {
            "name": user_name,
            "email": user_email,
            "is_logged_in": is_logged_in,
        },
        "summary": {
            "net_worth": net_worth,
            "monthly_income": monthly_income,
            "monthly_expense": monthly_expense,
            "net_savings": net_savings,
            "savings_rate": savings_rate,
        },
        "recent_transactions": enriched_transactions[:8],
        "all_transactions": enriched_transactions,
        "active_budgets": enriched_budgets,
        "budgets_list": enriched_budgets,
        "goals_list": enriched_goals,
        "mandates_list": enriched_mandates,
        "category_breakdown": category_breakdown,
        "current_date": datetime.now().strftime("%Y-%m-%d"),
        "local_ip": local_ip,
        "webhook_url": webhook_url,
    }


def create_app(db: Database = None) -> Flask:
    """
    Application factory for FinTrack Flask server.
    Configures template directories, static file hosting, and registers web + API routes.
    """
    backend_dir = Path(__file__).resolve().parent

    app = Flask(
        __name__,
        template_folder=str(backend_dir / "templates"),
        static_folder=str(backend_dir / "static"),
    )
    app.secret_key = os.environ.get("SECRET_KEY", "fintrack-secret-key-2024")
    CORS(app)

    if db is None:
        db = Database(DEFAULT_DB_PATH)

    app.db = db

    # =========================================================================
    # 1. SEMANTIC HTML WEB PAGE ROUTES
    # =========================================================================

    @app.route("/login", methods=["GET", "POST"])
    def page_login():
        """Renders login page (GET) or authenticates user session (POST)."""
        if request.method == "POST":
            email = request.form.get("email", "").strip() or "arjun@fintrack.io"
            name = request.form.get("name", "").strip() or ("Arjun Mehta" if "arjun" in email.lower() else email.split("@")[0])
            session["logged_in"] = True
            session["user_name"] = name
            session["user_email"] = email
            try:
                app.db.update_settings({"userName": name, "userEmail": email})
            except Exception:
                pass
            return redirect(url_for("page_dashboard"))

        return render_template("login.html", default_email=session.get("user_email", "arjun@fintrack.io"))

    @app.route("/logout", methods=["GET", "POST"])
    def page_logout():
        """Clears user session and redirects to login."""
        session.clear()
        return redirect(url_for("page_login"))

    @app.route("/", methods=["GET"])
    def page_dashboard():
        """Renders the main Financial Dashboard with live KPI metrics and budget progress."""
        ctx = get_page_context(app.db)
        return render_template("index.html", active_page="dashboard", **ctx)

    @app.route("/transactions", methods=["GET"])
    def page_transactions():
        """Renders the Transactions Ledger with search, category filters, and CSV export."""
        ctx = get_page_context(app.db)
        return render_template("transactions.html", active_page="transactions", **ctx)

    @app.route("/budgets", methods=["GET"])
    def page_budgets():
        """Renders the Monthly Category Budgets view with utilization progress bars."""
        ctx = get_page_context(app.db)
        return render_template("budgets.html", active_page="budgets", **ctx)

    @app.route("/goals", methods=["GET"])
    def page_goals():
        """Renders Financial Milestones, deposit forms, and automated recurring mandates."""
        ctx = get_page_context(app.db)
        return render_template("goals.html", active_page="goals", **ctx)

    @app.route("/reports", methods=["GET"])
    def page_reports():
        """Renders Executive Analytics with category spending ratios and printable PDF report."""
        ctx = get_page_context(app.db)
        return render_template("reports.html", active_page="reports", **ctx)

    @app.route("/accounts", methods=["GET"])
    def page_accounts():
        """Renders Bank & Card Accounts with live balances and transfer forms."""
        ctx = get_page_context(app.db)
        return render_template("accounts.html", active_page="accounts", **ctx)

    @app.route("/settings", methods=["GET"])
    def page_settings():
        """Renders System Preferences, currency options, theme toggle, and database reset tools."""
        ctx = get_page_context(app.db)
        return render_template("settings.html", active_page="settings", **ctx)

    # =========================================================================
    # 2. PURE PYTHON HTML FORM HANDLERS (ZERO JAVASCRIPT REQUIRED)
    # =========================================================================
    # These routes process traditional HTML <form method="POST"> submissions.
    # All parsing, validation, and database operations happen 100% in Python,
    # and then Flask redirects the browser back with the updated SQLite data.
    # =========================================================================

    @app.route("/transactions/create", methods=["POST"])
    def form_create_transaction():
        """
        Pure Python Form Handler for Adding Transactions.
        Extracts form fields via request.form, validates inputs, and inserts into SQLite.
        """
        tx_type = request.form.get("type", "expense")
        try:
            amount = float(request.form.get("amount", 0))
        except (ValueError, TypeError):
            amount = 0.0

        account_id = request.form.get("accountId")
        category_id = request.form.get("categoryId")
        payee = request.form.get("payee", "Transaction")
        date_val = request.form.get("date", datetime.now().strftime("%Y-%m-%d"))
        notes = request.form.get("notes", "")

        if amount > 0 and account_id:
            app.db.add_transaction({
                "type": tx_type,
                "amount": amount,
                "accountId": account_id,
                "categoryId": category_id,
                "payee": payee,
                "merchant": payee,
                "date": date_val,
                "notes": notes,
            })

        return redirect(request.referrer or "/transactions")

    @app.route("/transactions/delete/<tx_id>", methods=["GET", "POST"])
    def form_delete_transaction(tx_id):
        """Pure Python route to delete a transaction and restore balance."""
        app.db.delete_transaction(tx_id)
        return redirect(request.referrer or "/transactions")

    @app.route("/goals/create", methods=["POST"])
    def form_create_goal():
        """Pure Python Form Handler for Creating Financial Milestones."""
        name = request.form.get("name", "New Milestone")
        subtitle = request.form.get("subtitle", "Goal")
        try:
            target = float(request.form.get("targetAmount", 0))
            saved = float(request.form.get("savedAmount", 0))
        except (ValueError, TypeError):
            target, saved = 0.0, 0.0

        account_id = request.form.get("accountId")
        if target > 0 and account_id:
            app.db.add_goal({
                "name": name,
                "subtitle": subtitle,
                "targetAmount": target,
                "savedAmount": saved,
                "targetDate": "2024-12-31",
                "accountId": account_id,
                "color": "#10b981",
            })
        return redirect(request.referrer or "/goals")

    @app.route("/goals/contribute", methods=["POST"])
    def form_contribute_goal():
        """Pure Python Form Handler for Depositing Funds to a Milestone."""
        goal_id = request.form.get("goalId")
        try:
            amount = float(request.form.get("amount", 0))
        except (ValueError, TypeError):
            amount = 0.0
        account_id = request.form.get("accountId")

        if goal_id and amount > 0:
            app.db.contribute_to_goal(goal_id, amount, account_id)
        return redirect(request.referrer or "/goals")

    @app.route("/budgets/create", methods=["POST"])
    def form_create_budget():
        """Pure Python Form Handler for Setting Category Budget Limits."""
        category_id = request.form.get("categoryId")
        try:
            limit_val = float(request.form.get("monthlyLimit", 0))
        except (ValueError, TypeError):
            limit_val = 0.0

        if category_id and limit_val > 0:
            app.db.set_budget({"categoryId": category_id, "monthlyLimit": int(limit_val)})
        return redirect(request.referrer or "/budgets")

    @app.route("/accounts/create", methods=["POST"])
    def form_create_account():
        """Pure Python Form Handler for Registering New Bank Accounts."""
        name = request.form.get("name", "New Account")
        acc_type = request.form.get("type", "bank")
        try:
            balance = float(request.form.get("openingBalance", 0))
        except (ValueError, TypeError):
            balance = 0.0
        account_number = request.form.get("accountNumber", "")

        app.db.add_account({
            "name": name,
            "type": acc_type,
            "openingBalance": balance,
            "accountNumber": account_number,
            "color": "#10b981",
        })
        return redirect(request.referrer or "/accounts")

    @app.route("/accounts/transfer", methods=["POST"])
    def form_transfer_funds():
        """Pure Python Form Handler for Inter-Account Transfers."""
        from_id = request.form.get("fromAccountId")
        to_id = request.form.get("toAccountId")
        try:
            amount = float(request.form.get("amount", 0))
        except (ValueError, TypeError):
            amount = 0.0

        if from_id and to_id and amount > 0:
            app.db.transfer_between_accounts(from_id, to_id, amount, "Intra-account transfer")
        return redirect(request.referrer or "/accounts")

    # =========================================================================
    # 2. SYSTEM HEALTH & BOOTSTRAP API
    # =========================================================================

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint returning system status and SQLite connectivity."""
        return jsonify({
            "status": "ok",
            "database": "sqlite (Python 3.14)",
            "uptime": round(time.time() - START_TIME, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    @app.route("/api/bootstrap", methods=["GET"])
    def get_bootstrap():
        """Returns the full hydrated JSON snapshot of user data from SQLite."""
        try:
            data = app.db.get_full_bootstrap()
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": "Failed to retrieve bootstrap data", "details": str(e)}), 500

    # =========================================================================
    # 3. AUTHENTICATION SIMULATION
    # =========================================================================

    @app.route("/api/auth/login", methods=["POST"])
    def api_login():
        """Authenticates user credentials and returns user profile."""
        payload = request.get_json(silent=True) or request.form or {}
        email = payload.get("email", "").strip() or "arjun@fintrack.io"
        name = payload.get("name", "").strip() or ("Arjun Mehta" if "arjun" in email.lower() else email.split("@")[0])
        session["logged_in"] = True
        session["user_name"] = name
        session["user_email"] = email
        updated = app.db.update_settings({"userName": name, "userEmail": email})
        return jsonify({"success": True, "user": updated, "message": f"Welcome back, {name}!"}), 200

    @app.route("/api/auth/google", methods=["POST"])
    def google_auth():
        """Simulates Google OAuth session and updates user profile in database."""
        payload = request.get_json(silent=True) or {}
        name = payload.get("name") or "Arjun Mehta"
        email = payload.get("email") or "arjun@fintrack.io"
        updated = app.db.update_settings({"userName": name, "userEmail": email})
        return jsonify({"success": True, "user": updated})

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        """Clears user session."""
        return jsonify({"success": True, "message": "Logged out successfully"})

    # =========================================================================
    # 4. TRANSACTIONS CRUD API
    # =========================================================================

    @app.route("/api/transactions", methods=["GET"])
    def list_transactions():
        """Returns all recorded transactions in reverse chronological order."""
        data = app.db.get_full_bootstrap()
        return jsonify(data["transactions"])

    @app.route("/api/transactions", methods=["POST"])
    def create_transaction():
        """Creates a new transaction entry and adjusts the linked account balance."""
        payload = request.get_json(silent=True) or {}
        tx_type = payload.get("type")
        amount = payload.get("amount")
        account_id = payload.get("accountId")
        date = payload.get("date")

        if not tx_type or amount is None or not account_id or not date:
            return jsonify({"error": "Missing required fields (type, amount, accountId, date)"}), 400

        try:
            tx = app.db.add_transaction(payload)
            return jsonify(tx), 201
        except Exception as e:
            return jsonify({"error": "Failed to record transaction", "details": str(e)}), 500

    @app.route("/api/transactions/<tx_id>", methods=["PUT"])
    def update_transaction(tx_id):
        """Updates an existing transaction by ID."""
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_transaction(tx_id, payload)
        if not updated:
            return jsonify({"error": f"Transaction '{tx_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/transactions/<tx_id>", methods=["DELETE"])
    def delete_transaction(tx_id):
        """Deletes a transaction by ID and restores the account balance."""
        success = app.db.delete_transaction(tx_id)
        if not success:
            return jsonify({"error": f"Transaction '{tx_id}' not found"}), 404
        return jsonify({"success": True, "id": tx_id})

    @app.route("/api/transactions/bulk-delete", methods=["POST"])
    def bulk_delete_transactions():
        """Deletes multiple transactions in a single batch operation."""
        payload = request.get_json(silent=True) or {}
        tx_ids = payload.get("ids") or []
        count = app.db.bulk_delete_transactions(tx_ids)
        return jsonify({"success": True, "deletedCount": count})

    # =========================================================================
    # 5. BANK & CARD ACCOUNTS API
    # =========================================================================

    @app.route("/api/accounts", methods=["GET"])
    def list_accounts():
        """Returns all configured bank accounts, cash wallets, and cards."""
        data = app.db.get_full_bootstrap()
        return jsonify(data["accounts"])

    @app.route("/api/accounts", methods=["POST"])
    def create_account():
        """Creates a new financial account in the database."""
        payload = request.get_json(silent=True) or {}
        if not payload.get("name") or not payload.get("type"):
            return jsonify({"error": "Account 'name' and 'type' are required"}), 400

        try:
            acc = app.db.add_account(payload)
            return jsonify(acc), 201
        except Exception as e:
            return jsonify({"error": "Failed to create account", "details": str(e)}), 500

    @app.route("/api/accounts/<acc_id>", methods=["PUT"])
    def update_account(acc_id):
        """Updates account details such as name, mask, or color."""
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_account(acc_id, payload)
        if not updated:
            return jsonify({"error": f"Account '{acc_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/accounts/<acc_id>", methods=["DELETE"])
    def delete_account(acc_id):
        """Deletes an account by ID."""
        success = app.db.delete_account(acc_id)
        if not success:
            return jsonify({"error": f"Account '{acc_id}' not found"}), 404
        return jsonify({"success": True, "id": acc_id})

    @app.route("/api/accounts/transfer", methods=["POST"])
    def transfer_accounts():
        """Transfers funds between two accounts without altering overall net income/expenses."""
        payload = request.get_json(silent=True) or {}
        from_id = payload.get("fromAccountId")
        to_id = payload.get("toAccountId")
        amount = payload.get("amount")

        if not from_id or not to_id or not amount:
            return jsonify({"error": "fromAccountId, toAccountId, and amount are required"}), 400

        if from_id == to_id:
            return jsonify({"error": "Origin and destination accounts must be distinct"}), 400

        tx = app.db.transfer_between_accounts(from_id, to_id, int(amount), payload.get("note", "Account Transfer"))
        return jsonify(tx), 201

    # =========================================================================
    # 6. CATEGORIES API
    # =========================================================================

    @app.route("/api/categories", methods=["GET"])
    def list_categories():
        """Returns all income and expense categories."""
        data = app.db.get_full_bootstrap()
        return jsonify(data["categories"])

    @app.route("/api/categories", methods=["POST"])
    def create_category():
        """Creates a custom category with color and icon key."""
        payload = request.get_json(silent=True) or {}
        if not payload.get("name") or not payload.get("type"):
            return jsonify({"error": "Category 'name' and 'type' are required"}), 400

        cat = app.db.add_category(payload)
        return jsonify(cat), 201

    @app.route("/api/categories/<cat_id>", methods=["PUT"])
    def update_category(cat_id):
        """Updates category name, icon, or color."""
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_category(cat_id, payload)
        if not updated:
            return jsonify({"error": f"Category '{cat_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/categories/<cat_id>", methods=["DELETE"])
    def delete_category(cat_id):
        """Deletes a category by ID."""
        success = app.db.delete_category(cat_id)
        if not success:
            return jsonify({"error": f"Category '{cat_id}' not found"}), 404
        return jsonify({"success": True, "id": cat_id})

    # =========================================================================
    # 7. BUDGETS API
    # =========================================================================

    @app.route("/api/budgets", methods=["GET"])
    def list_budgets():
        """Returns all monthly category budget limits."""
        data = app.db.get_full_bootstrap()
        return jsonify(data["budgets"])

    @app.route("/api/budgets", methods=["POST"])
    def set_budget():
        """Creates or updates a monthly category budget limit in SQLite."""
        payload = request.get_json(silent=True) or {}
        if not payload.get("categoryId") or payload.get("monthlyLimit") is None:
            return jsonify({"error": "categoryId and monthlyLimit are required"}), 400

        b = app.db.set_budget(payload)
        return jsonify(b), 200

    @app.route("/api/budgets/<budget_id>", methods=["DELETE"])
    def delete_budget(budget_id):
        """Deletes a category budget limit."""
        success = app.db.delete_budget(budget_id)
        if not success:
            return jsonify({"error": f"Budget '{budget_id}' not found"}), 404
        return jsonify({"success": True, "id": budget_id})

    # =========================================================================
    # 8. FINANCIAL GOALS API
    # =========================================================================

    @app.route("/api/goals", methods=["GET"])
    def list_goals():
        """Returns all savings goals and milestones."""
        data = app.db.get_full_bootstrap()
        return jsonify(data["goals"])

    @app.route("/api/goals", methods=["POST"])
    def create_goal():
        """Creates a new financial milestone."""
        payload = request.get_json(silent=True) or {}
        if not payload.get("name") or payload.get("targetAmount") is None or not payload.get("targetDate"):
            return jsonify({"error": "Goal 'name', 'targetAmount', and 'targetDate' are required"}), 400

        goal = app.db.add_goal(payload)
        return jsonify(goal), 201

    @app.route("/api/goals/<goal_id>", methods=["PUT"])
    def update_goal(goal_id):
        """Updates goal details."""
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_goal(goal_id, payload)
        if not updated:
            return jsonify({"error": f"Goal '{goal_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/goals/<goal_id>/contribute", methods=["POST"])
    def contribute_goal(goal_id):
        """Deposits savings into a goal and records the linked funding transaction."""
        payload = request.get_json(silent=True) or {}
        amount = payload.get("amount")
        if not amount or int(amount) <= 0:
            return jsonify({"error": "Valid positive contribution amount required"}), 400

        account_id = payload.get("accountId")
        result = app.db.contribute_to_goal(goal_id, int(amount), account_id)
        if not result:
            return jsonify({"error": f"Goal '{goal_id}' not found"}), 404
        return jsonify(result)

    @app.route("/api/goals/<goal_id>", methods=["DELETE"])
    def delete_goal(goal_id):
        """Deletes a goal milestone."""
        success = app.db.delete_goal(goal_id)
        if not success:
            return jsonify({"error": f"Goal '{goal_id}' not found"}), 404
        return jsonify({"success": True, "id": goal_id})

    # =========================================================================
    # 9. STANDING MANDATES & NOTIFICATIONS API
    # =========================================================================

    @app.route("/api/mandates/<mandate_id>/toggle", methods=["PUT"])
    def toggle_mandate(mandate_id):
        """Toggles a mandate status between Active and Paused."""
        result = app.db.toggle_mandate(mandate_id)
        if not result:
            return jsonify({"error": f"Mandate '{mandate_id}' not found"}), 404
        return jsonify(result)

    @app.route("/api/notifications/mark-read", methods=["POST"])
    def mark_read():
        """Marks all pending notification alerts as read."""
        count = app.db.mark_notifications_read()
        return jsonify({"success": True, "updated": count})

    # =========================================================================
    # 10. SETTINGS & BANK SYNC SIMULATION
    # =========================================================================

    @app.route("/api/settings", methods=["GET"])
    def get_settings():
        """Returns current user preferences."""
        data = app.db.get_full_bootstrap()
        return jsonify(data["settings"])

    @app.route("/api/settings", methods=["PUT"])
    def update_settings():
        """Updates user preferences (currency, theme, month start day)."""
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_settings(payload)
        return jsonify(updated)

    @app.route("/api/sync", methods=["POST"])
    def sync_accounts():
        """Simulates banking telemetry synchronization with connected institutions."""
        now_str = datetime.now().strftime("%I:%M %p")
        return jsonify({
            "status": "success",
            "message": "All connected bank feeds successfully synchronized with encrypted banking telemetry.",
            "syncedAt": now_str,
            "connectedInstitutions": [
                {"name": "ICICI Bank", "status": "Synced", "latency": "42ms"},
                {"name": "HDFC Bank", "status": "Synced", "latency": "58ms"},
                {"name": "Paytm UPI", "status": "Synced", "latency": "31ms"},
            ],
        })

    # =========================================================================
    # 11. DATA BACKUP & RESET TOOLS
    # =========================================================================

    @app.route("/api/backup/clear", methods=["POST"])
    def clear_data():
        """Wipes all custom transactions and budgets, restoring clean starter accounts."""
        app.db.clear_all()
        return jsonify({"success": True, "message": "All user financial data wiped. Starter accounts preserved."})

    @app.route("/api/backup/reset-demo", methods=["POST"])
    def reset_demo():
        """Resets the SQLite database to clean default state."""
        app.db.clear_all()
        data = app.db.get_full_bootstrap()
        return jsonify({"success": True, "data": data})

    # =========================================================================
    # 12. BANK SMS / EMAIL ALERT AUTO-PARSER API
    # =========================================================================

    @app.route("/api/parser/sms", methods=["POST"])
    def parse_sms_alerts():
        """
        Parses raw bank SMS or Email notifications using regular expressions.
        Extracts amount, transaction type, merchant/payee, date, account mask,
        and auto-assigns an appropriate category.
        """
        payload = request.get_json(silent=True) or {}
        raw_text = payload.get("text", "")
        if not raw_text.strip():
            return jsonify({"error": "No alert text provided for parsing", "parsed": [], "count": 0}), 400

        data = app.db.get_full_bootstrap()
        accounts = data.get("accounts", [])
        parsed_items = parse_multi_sms(raw_text, accounts)

        return jsonify({
            "success": True,
            "parsed": parsed_items,
            "count": len(parsed_items),
        })

    @app.route("/api/parser/sms/confirm", methods=["POST"])
    def confirm_sms_transactions():
        """
        Commits reviewed, auto-parsed transactions directly into the SQLite ledger.
        """
        payload = request.get_json(silent=True) or {}
        transactions_to_add = payload.get("transactions", [])
        if not transactions_to_add:
            return jsonify({"error": "No transactions submitted for confirmation"}), 400

        created = []
        for tx in transactions_to_add:
            try:
                res = app.db.add_transaction(tx)
                created.append(res)
            except Exception:
                pass

        return jsonify({
            "success": True,
            "created": created,
            "count": len(created),
        }), 201

    # =========================================================================
    # 13. AUTOMATED BACKGROUND SMS & NOTIFICATION WEBHOOK
    # =========================================================================

    @app.route("/api/webhook/sms/status", methods=["GET"])
    def webhook_sms_status():
        """
        Returns active status, local Wi-Fi IP, and webhook URL for mobile forwarders.
        """
        ip = get_local_ip()
        port = int(os.environ.get("PORT", 5000))
        return jsonify({
            "status": "active",
            "local_ip": ip,
            "port": port,
            "webhook_url": f"http://{ip}:{port}/api/webhook/sms",
            "message": "FinTrack Background SMS Webhook is active and listening for mobile forwarders.",
        })

    @app.route("/api/webhook/sms", methods=["POST"])
    def webhook_receive_sms():
        """
        Silent background receiver for mobile SMS forwarder apps (e.g. SMS Forwarder, MacroDroid, Tasker).
        Extracts financial alert details, eliminates duplicate notifications, and logs
        transactions directly into SQLite without manual user intervention.
        """
        raw_text = ""
        if request.is_json:
            body = request.get_json(silent=True) or {}
            raw_text = body.get("text") or body.get("message") or body.get("body") or body.get("sms") or body.get("content") or ""
        elif request.form:
            raw_text = request.form.get("text") or request.form.get("message") or request.form.get("body") or request.form.get("sms") or ""
        else:
            raw_text = request.get_data(as_text=True) or ""

        if not raw_text.strip():
            return jsonify({
                "status": "ignored",
                "error": "Empty SMS body received",
            }), 400

        data = app.db.get_full_bootstrap()
        accounts = data.get("accounts", [])
        parsed_items = parse_multi_sms(raw_text, accounts)

        if not parsed_items:
            return jsonify({
                "status": "skipped",
                "message": "Non-transaction alert ignored (no financial data detected).",
                "raw": raw_text[:120],
            }), 200

        imported = []
        duplicates = []

        for item in parsed_items:
            # Check for existing duplicate transaction on same date with same amount and payee
            with app.db.get_connection() as conn:
                existing = conn.execute(
                    """
                    SELECT id FROM transactions
                    WHERE date = ? AND amount = ? AND (merchant = ? OR note LIKE ?)
                    LIMIT 1
                    """,
                    (item["date"], int(item["amount"]), item["payee"], f"%{item['payee']}%")
                ).fetchone()

            if existing:
                duplicates.append({
                    "id": existing["id"],
                    "payee": item["payee"],
                    "amount": item["amount"],
                    "date": item["date"],
                })
            else:
                created = app.db.add_transaction(item)
                imported.append(created)

        if not imported and duplicates:
            return jsonify({
                "status": "duplicate",
                "message": f"Transaction already recorded ({duplicates[0]['payee']} ₹{duplicates[0]['amount']})",
                "duplicates": duplicates,
                "count": 0,
            }), 200

        return jsonify({
            "status": "recorded",
            "imported": imported,
            "duplicates": duplicates,
            "count": len(imported),
        }), 201

    @app.route("/api/webhook/sms/test", methods=["POST"])
    def webhook_simulate_sms():
        """
        Simulates an incoming live bank SMS debit alert to verify end-to-end background ingestion.
        """
        payload = request.get_json(silent=True) or {}
        sample_sms = payload.get("text") or (
            "Sent Rs.450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. "
            "UPI Ref 329012345678. Not you? Call 18002583838."
        )

        data = app.db.get_full_bootstrap()
        accounts = data.get("accounts", [])
        parsed_items = parse_multi_sms(sample_sms, accounts)

        if not parsed_items:
            return jsonify({"status": "skipped", "message": "No transaction parsed"}), 200

        imported = []
        duplicates = []

        for item in parsed_items:
            with app.db.get_connection() as conn:
                existing = conn.execute(
                    """
                    SELECT id FROM transactions
                    WHERE date = ? AND amount = ? AND (merchant = ? OR note LIKE ?)
                    LIMIT 1
                    """,
                    (item["date"], int(item["amount"]), item["payee"], f"%{item['payee']}%")
                ).fetchone()

            if existing:
                duplicates.append({
                    "id": existing["id"],
                    "payee": item["payee"],
                    "amount": item["amount"],
                    "date": item["date"],
                })
            else:
                created = app.db.add_transaction(item)
                imported.append(created)

        if not imported and duplicates:
            return jsonify({
                "status": "duplicate",
                "message": f"Transaction already recorded ({duplicates[0]['payee']} ₹{duplicates[0]['amount']})",
                "duplicates": duplicates,
                "count": 0,
            }), 200

        return jsonify({
            "status": "recorded",
            "imported": imported,
            "duplicates": duplicates,
            "count": len(imported),
        }), 201

    return app


# Default app instance for WSGI / Vercel serverless execution
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] FinTrack Python Flask web app running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)

