import os
import sys
import time
from pathlib import Path
from datetime import datetime, timezone

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from flask import Flask, jsonify, request
from flask_cors import CORS
from backend.database import Database, DEFAULT_DB_PATH

START_TIME = time.time()


def create_app(db: Database = None) -> Flask:
    app = Flask(__name__)
    CORS(app)

    if db is None:
        db = Database(DEFAULT_DB_PATH)

    app.db = db

    # ------------------------------------------------------------------
    # System & Health
    # ------------------------------------------------------------------
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "ok",
            "database": "sqlite (Python 3.14)",
            "uptime": round(time.time() - START_TIME, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    # ------------------------------------------------------------------
    # Bootstrap Hydration
    # ------------------------------------------------------------------
    @app.route("/api/bootstrap", methods=["GET"])
    def get_bootstrap():
        try:
            data = app.db.get_full_bootstrap()
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": "Failed to retrieve bootstrap data", "details": str(e)}), 500

    # ------------------------------------------------------------------
    # Auth & Session Simulation
    # ------------------------------------------------------------------
    @app.route("/api/auth/google", methods=["POST"])
    def google_auth():
        payload = request.get_json(silent=True) or {}
        name = payload.get("name") or "Arjun Mehta"
        email = payload.get("email") or "arjun@fintrack.io"
        updated = app.db.update_settings({"userName": name, "userEmail": email})
        return jsonify({"success": True, "user": updated})

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        return jsonify({"success": True, "message": "Logged out successfully"})

    # ------------------------------------------------------------------
    # Transactions
    # ------------------------------------------------------------------
    @app.route("/api/transactions", methods=["GET"])
    def list_transactions():
        data = app.db.get_full_bootstrap()
        return jsonify(data["transactions"])

    @app.route("/api/transactions", methods=["POST"])
    def create_transaction():
        payload = request.get_json(silent=True) or {}
        tx_type = payload.get("type")
        amount = payload.get("amount")
        account_id = payload.get("accountId")
        date = payload.get("date")

        if not tx_type or amount is None or not account_id or not date:
            return jsonify({"error": "Missing required transaction fields (type, amount, accountId, date)"}), 400

        try:
            tx = app.db.add_transaction(payload)
            return jsonify(tx), 201
        except Exception as e:
            return jsonify({"error": "Failed to record transaction", "details": str(e)}), 500

    @app.route("/api/transactions/<tx_id>", methods=["PUT"])
    def update_transaction(tx_id):
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_transaction(tx_id, payload)
        if not updated:
            return jsonify({"error": f"Transaction '{tx_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/transactions/<tx_id>", methods=["DELETE"])
    def delete_transaction(tx_id):
        success = app.db.delete_transaction(tx_id)
        if not success:
            return jsonify({"error": f"Transaction '{tx_id}' not found"}), 404
        return jsonify({"success": True, "id": tx_id})

    @app.route("/api/transactions/bulk-delete", methods=["POST"])
    def bulk_delete_transactions():
        payload = request.get_json(silent=True) or {}
        tx_ids = payload.get("ids") or []
        count = app.db.bulk_delete_transactions(tx_ids)
        return jsonify({"success": True, "deletedCount": count})

    # ------------------------------------------------------------------
    # Accounts
    # ------------------------------------------------------------------
    @app.route("/api/accounts", methods=["GET"])
    def list_accounts():
        data = app.db.get_full_bootstrap()
        return jsonify(data["accounts"])

    @app.route("/api/accounts", methods=["POST"])
    def create_account():
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
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_account(acc_id, payload)
        if not updated:
            return jsonify({"error": f"Account '{acc_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/accounts/<acc_id>", methods=["DELETE"])
    def delete_account(acc_id):
        success = app.db.delete_account(acc_id)
        if not success:
            return jsonify({"error": f"Account '{acc_id}' not found"}), 404
        return jsonify({"success": True, "id": acc_id})

    @app.route("/api/accounts/transfer", methods=["POST"])
    def transfer_accounts():
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

    # ------------------------------------------------------------------
    # Categories
    # ------------------------------------------------------------------
    @app.route("/api/categories", methods=["GET"])
    def list_categories():
        data = app.db.get_full_bootstrap()
        return jsonify(data["categories"])

    @app.route("/api/categories", methods=["POST"])
    def create_category():
        payload = request.get_json(silent=True) or {}
        if not payload.get("name") or not payload.get("type"):
            return jsonify({"error": "Category 'name' and 'type' are required"}), 400

        cat = app.db.add_category(payload)
        return jsonify(cat), 201

    @app.route("/api/categories/<cat_id>", methods=["PUT"])
    def update_category(cat_id):
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_category(cat_id, payload)
        if not updated:
            return jsonify({"error": f"Category '{cat_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/categories/<cat_id>", methods=["DELETE"])
    def delete_category(cat_id):
        success = app.db.delete_category(cat_id)
        if not success:
            return jsonify({"error": f"Category '{cat_id}' not found"}), 404
        return jsonify({"success": True, "id": cat_id})

    # ------------------------------------------------------------------
    # Budgets
    # ------------------------------------------------------------------
    @app.route("/api/budgets", methods=["GET"])
    def list_budgets():
        data = app.db.get_full_bootstrap()
        return jsonify(data["budgets"])

    @app.route("/api/budgets", methods=["POST"])
    def set_budget():
        payload = request.get_json(silent=True) or {}
        if not payload.get("categoryId") or payload.get("monthlyLimit") is None:
            return jsonify({"error": "categoryId and monthlyLimit are required"}), 400

        b = app.db.set_budget(payload)
        return jsonify(b), 200

    @app.route("/api/budgets/<budget_id>", methods=["DELETE"])
    def delete_budget(budget_id):
        success = app.db.delete_budget(budget_id)
        if not success:
            return jsonify({"error": f"Budget '{budget_id}' not found"}), 404
        return jsonify({"success": True, "id": budget_id})

    # ------------------------------------------------------------------
    # Goals
    # ------------------------------------------------------------------
    @app.route("/api/goals", methods=["GET"])
    def list_goals():
        data = app.db.get_full_bootstrap()
        return jsonify(data["goals"])

    @app.route("/api/goals", methods=["POST"])
    def create_goal():
        payload = request.get_json(silent=True) or {}
        if not payload.get("name") or payload.get("targetAmount") is None or not payload.get("targetDate"):
            return jsonify({"error": "Goal 'name', 'targetAmount', and 'targetDate' are required"}), 400

        goal = app.db.add_goal(payload)
        return jsonify(goal), 201

    @app.route("/api/goals/<goal_id>", methods=["PUT"])
    def update_goal(goal_id):
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_goal(goal_id, payload)
        if not updated:
            return jsonify({"error": f"Goal '{goal_id}' not found"}), 404
        return jsonify(updated)

    @app.route("/api/goals/<goal_id>/contribute", methods=["POST"])
    def contribute_goal(goal_id):
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
        success = app.db.delete_goal(goal_id)
        if not success:
            return jsonify({"error": f"Goal '{goal_id}' not found"}), 404
        return jsonify({"success": True, "id": goal_id})

    # ------------------------------------------------------------------
    # Mandates & Notifications
    # ------------------------------------------------------------------
    @app.route("/api/mandates/<mandate_id>/toggle", methods=["PUT"])
    def toggle_mandate(mandate_id):
        result = app.db.toggle_mandate(mandate_id)
        if not result:
            return jsonify({"error": f"Mandate '{mandate_id}' not found"}), 404
        return jsonify(result)

    @app.route("/api/notifications/mark-read", methods=["POST"])
    def mark_read():
        count = app.db.mark_notifications_read()
        return jsonify({"success": True, "updated": count})

    # ------------------------------------------------------------------
    # Settings & Bank Sync
    # ------------------------------------------------------------------
    @app.route("/api/settings", methods=["GET"])
    def get_settings():
        data = app.db.get_full_bootstrap()
        return jsonify(data["settings"])

    @app.route("/api/settings", methods=["PUT"])
    def update_settings():
        payload = request.get_json(silent=True) or {}
        updated = app.db.update_settings(payload)
        return jsonify(updated)

    @app.route("/api/sync", methods=["POST"])
    def sync_accounts():
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

    # ------------------------------------------------------------------
    # Backup & Data Clear
    # ------------------------------------------------------------------
    @app.route("/api/backup/clear", methods=["POST"])
    def clear_data():
        app.db.clear_all()
        return jsonify({"success": True, "message": "All user financial data wiped. Starter accounts preserved."})

    @app.route("/api/backup/reset-demo", methods=["POST"])
    def reset_demo():
        app.db.clear_all()
        data = app.db.get_full_bootstrap()
        return jsonify({"success": True, "data": data})

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app = create_app()
    print(f"[*] FinTrack Python Flask API running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
