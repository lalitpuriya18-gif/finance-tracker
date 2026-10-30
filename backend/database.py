"""
FinTrack Database Management Layer using native Python sqlite3.
Provides schema initialization, seed data management, and full CRUD helpers.
"""

import os
import sqlite3
import json
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "data", "fintrack.db")

DEFAULT_CATEGORIES = [
    {"id": "cat-income", "name": "Income", "icon": "Briefcase", "color": "#10b981", "type": "income"},
    {"id": "cat-food", "name": "Food & Dining", "icon": "Utensils", "color": "#10b981", "type": "expense"},
    {"id": "cat-shopping", "name": "Shopping & Lifestyle", "icon": "ShoppingBag", "color": "#f43f5e", "type": "expense"},
    {"id": "cat-transport", "name": "Transport & Commute", "icon": "Car", "color": "#06b6d4", "type": "expense"},
    {"id": "cat-bills", "name": "Bills & Utilities", "icon": "Zap", "color": "#3b82f6", "type": "expense"},
    {"id": "cat-rent", "name": "Rent & Living", "icon": "Home", "color": "#1e293b", "type": "expense"},
    {"id": "cat-entertainment", "name": "Entertainment", "icon": "Tv", "color": "#8b5cf6", "type": "expense"},
    {"id": "cat-health", "name": "Health & Wellness", "icon": "HeartPulse", "color": "#14b8a6", "type": "expense"},
    {"id": "cat-investment", "name": "Investment", "icon": "TrendingUp", "color": "#6366f1", "type": "expense"},
]

DEFAULT_ACCOUNTS = [
    {
        "id": "acc-primary-bank",
        "name": "Primary Bank Account",
        "type": "bank",
        "openingBalance": 0,
        "accountNumber": "..8921",
        "color": "#065f46",
    },
    {
        "id": "acc-savings",
        "name": "Savings Account",
        "type": "bank",
        "openingBalance": 0,
        "accountNumber": "..9902",
        "color": "#047857",
    },
    {
        "id": "acc-cash",
        "name": "Cash Wallet",
        "type": "cash",
        "openingBalance": 0,
        "color": "#0284c7",
    },
    {
        "id": "acc-credit-card",
        "name": "Credit Card",
        "type": "card",
        "openingBalance": 0,
        "accountNumber": "..4092",
        "color": "#6366f1",
    },
]


class Database:
    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        self._mem_conn = None
        if db_path != ":memory:":
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        else:
            self._mem_conn = sqlite3.connect(":memory:", check_same_thread=False)
            self._mem_conn.row_factory = sqlite3.Row
            self._mem_conn.execute("PRAGMA foreign_keys = ON")
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        if self._mem_conn is not None:
            return self._mem_conn
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    avatar TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS settings (
                    user_id TEXT PRIMARY KEY,
                    currency TEXT NOT NULL DEFAULT 'INR',
                    theme TEXT NOT NULL DEFAULT 'light',
                    month_start_day INTEGER NOT NULL DEFAULT 1,
                    user_name TEXT NOT NULL DEFAULT 'FinTrack User',
                    user_email TEXT NOT NULL DEFAULT 'user@fintrack.io',
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    opening_balance INTEGER NOT NULL DEFAULT 0,
                    account_number TEXT,
                    color TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    name TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    type TEXT NOT NULL,
                    is_archived INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    type TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    category_id TEXT NOT NULL,
                    account_id TEXT NOT NULL,
                    to_account_id TEXT,
                    date TEXT NOT NULL,
                    time TEXT,
                    note TEXT NOT NULL DEFAULT '',
                    description_detail TEXT,
                    merchant TEXT,
                    tags TEXT,
                    status TEXT DEFAULT 'Completed',
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS budgets (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    category_id TEXT NOT NULL,
                    monthly_limit INTEGER NOT NULL,
                    subtitle TEXT,
                    daily_allowance INTEGER,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS goals (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    name TEXT NOT NULL,
                    subtitle TEXT,
                    target_amount INTEGER NOT NULL,
                    saved_amount INTEGER NOT NULL DEFAULT 0,
                    target_date TEXT NOT NULL,
                    color TEXT,
                    priority TEXT,
                    monthly_contribution INTEGER,
                    funding_method TEXT,
                    pace_status_text TEXT,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS mandates (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    goal_name TEXT NOT NULL,
                    mandate_type TEXT NOT NULL,
                    cycle_date TEXT NOT NULL,
                    monthly_allocation INTEGER NOT NULL,
                    est_completion TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'Active',
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS notifications (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL DEFAULT 'user-default',
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    time_text TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'info',
                    is_unread INTEGER NOT NULL DEFAULT 1,
                    link TEXT NOT NULL DEFAULT '/dashboard',
                    created_at TEXT NOT NULL
                );
            """)

            # Seed default user & settings if empty
            user = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()
            if user["count"] == 0:
                now = datetime.now(timezone.utc).isoformat()
                conn.execute(
                    "INSERT INTO users (id, name, email, avatar, created_at) VALUES (?, ?, ?, ?, ?)",
                    ("user-default", "FinTrack User", "user@fintrack.io", "", now)
                )
                conn.execute(
                    "INSERT INTO settings (user_id, currency, theme, month_start_day, user_name, user_email, updated_at) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    ("user-default", "INR", "light", 1, "FinTrack User", "user@fintrack.io", now)
                )

            # Seed default categories if none exist
            cat_count = conn.execute("SELECT COUNT(*) as count FROM categories").fetchone()
            if cat_count["count"] == 0:
                self.seed_default_categories(conn, "user-default")

            # Seed default accounts if none exist
            acc_count = conn.execute("SELECT COUNT(*) as count FROM accounts").fetchone()
            if acc_count["count"] == 0:
                self.seed_default_accounts(conn, "user-default")

    def seed_default_categories(self, conn: sqlite3.Connection, user_id: str = "user-default"):
        now = datetime.now(timezone.utc).isoformat()
        for cat in DEFAULT_CATEGORIES:
            conn.execute(
                "INSERT OR REPLACE INTO categories (id, user_id, name, icon, color, type, is_archived, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, 0, ?)",
                (cat["id"], user_id, cat["name"], cat["icon"], cat["color"], cat["type"], now)
            )

    def seed_default_accounts(self, conn: sqlite3.Connection, user_id: str = "user-default"):
        now = datetime.now(timezone.utc).isoformat()
        for acc in DEFAULT_ACCOUNTS:
            conn.execute(
                "INSERT OR REPLACE INTO accounts (id, user_id, name, type, opening_balance, account_number, color, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (acc["id"], user_id, acc["name"], acc["type"], acc["openingBalance"], acc.get("accountNumber", ""), acc.get("color", "#065f46"), now)
            )

    # ------------------------------------------------------------------
    # Bootstrap Hydration
    # ------------------------------------------------------------------
    def get_full_bootstrap(self, user_id: str = "user-default") -> Dict[str, Any]:
        with self.get_connection() as conn:
            # Settings
            s = conn.execute("SELECT * FROM settings WHERE user_id = ?", (user_id,)).fetchone()
            settings = {
                "currency": s["currency"] if s else "INR",
                "theme": s["theme"] if s else "light",
                "monthStartDay": s["month_start_day"] if s else 1,
                "userName": s["user_name"] if s else "FinTrack User",
                "userEmail": s["user_email"] if s else "user@fintrack.io",
            }

            # Accounts
            a_rows = conn.execute("SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC", (user_id,)).fetchall()
            accounts = [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "type": r["type"],
                    "openingBalance": r["opening_balance"],
                    "accountNumber": r["account_number"] or None,
                    "color": r["color"] or None,
                }
                for r in a_rows
            ]

            # Categories
            c_rows = conn.execute("SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC", (user_id,)).fetchall()
            categories = [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "icon": r["icon"],
                    "color": r["color"],
                    "type": r["type"],
                    "isArchived": bool(r["is_archived"]),
                }
                for r in c_rows
            ]

            # Transactions
            t_rows = conn.execute(
                "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC", (user_id,)
            ).fetchall()
            transactions = [
                {
                    "id": r["id"],
                    "type": r["type"],
                    "amount": r["amount"],
                    "categoryId": r["category_id"],
                    "accountId": r["account_id"],
                    "toAccountId": r["to_account_id"] or None,
                    "date": r["date"],
                    "time": r["time"] or None,
                    "note": r["note"],
                    "descriptionDetail": r["description_detail"] or None,
                    "merchant": r["merchant"] or None,
                    "payee": r["merchant"] or r["note"] or "Transaction",
                    "tags": json.loads(r["tags"]) if r["tags"] else [],
                    "status": r["status"] or "Completed",
                }
                for r in t_rows
            ]

            # Budgets
            b_rows = conn.execute("SELECT * FROM budgets WHERE user_id = ?", (user_id,)).fetchall()
            budgets = [
                {
                    "id": r["id"],
                    "categoryId": r["category_id"],
                    "monthlyLimit": r["monthly_limit"],
                    "subtitle": r["subtitle"] or None,
                    "dailyAllowance": r["daily_allowance"] or None,
                }
                for r in b_rows
            ]

            # Goals
            g_rows = conn.execute("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC", (user_id,)).fetchall()
            goals = [
                {
                    "id": r["id"],
                    "name": r["name"],
                    "subtitle": r["subtitle"] or None,
                    "targetAmount": r["target_amount"],
                    "savedAmount": r["saved_amount"],
                    "targetDate": r["target_date"],
                    "color": r["color"] or None,
                    "priority": r["priority"] or None,
                    "monthlyContribution": r["monthly_contribution"] or None,
                    "fundingMethod": r["funding_method"] or None,
                    "paceStatusText": r["pace_status_text"] or None,
                }
                for r in g_rows
            ]

            # Mandates
            m_rows = conn.execute("SELECT * FROM mandates WHERE user_id = ?", (user_id,)).fetchall()
            mandates = [
                {
                    "id": r["id"],
                    "goalName": r["goal_name"],
                    "mandateType": r["mandate_type"],
                    "cycleDate": r["cycle_date"],
                    "monthlyAllocation": r["monthly_allocation"],
                    "estCompletion": r["est_completion"],
                    "status": r["status"],
                }
                for r in m_rows
            ]

            # Notifications
            n_rows = conn.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", (user_id,)).fetchall()
            notifications = [
                {
                    "id": r["id"],
                    "title": r["title"],
                    "description": r["description"],
                    "time": r["time_text"],
                    "type": r["type"],
                    "isUnread": bool(r["is_unread"]),
                    "link": r["link"],
                }
                for r in n_rows
            ]

            return {
                "transactions": transactions,
                "accounts": accounts,
                "categories": categories,
                "budgets": budgets,
                "goals": goals,
                "recurringRules": [],
                "mandates": mandates,
                "settings": settings,
                "notifications": notifications,
            }

    # ------------------------------------------------------------------
    # Transactions CRUD
    # ------------------------------------------------------------------
    def add_transaction(self, tx_data: Dict[str, Any], user_id: str = "user-default") -> Dict[str, Any]:
        tx_id = tx_data.get("id") or f"tx-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        tags_json = json.dumps(tx_data.get("tags", []))
        merchant = tx_data.get("merchant") or tx_data.get("payee") or ""
        note = tx_data.get("note") or tx_data.get("notes") or ""

        with self.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO transactions (
                    id, user_id, type, amount, category_id, account_id, to_account_id,
                    date, time, note, description_detail, merchant, tags, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    tx_id,
                    user_id,
                    tx_data["type"],
                    int(tx_data["amount"]),
                    tx_data.get("categoryId", ""),
                    tx_data["accountId"],
                    tx_data.get("toAccountId"),
                    tx_data["date"],
                    tx_data.get("time", datetime.now().strftime("%I:%M %p")),
                    note,
                    tx_data.get("descriptionDetail"),
                    merchant,
                    tags_json,
                    tx_data.get("status", "Completed"),
                    now,
                )
            )

        return {
            "id": tx_id,
            **tx_data,
            "payee": merchant or note or "Transaction",
            "merchant": merchant,
            "note": note,
            "tags": tx_data.get("tags", []),
            "time": tx_data.get("time", datetime.now().strftime("%I:%M %p")),
            "status": tx_data.get("status", "Completed"),
        }

    def update_transaction(self, tx_id: str, updates: Dict[str, Any], user_id: str = "user-default") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            existing = conn.execute("SELECT * FROM transactions WHERE id = ? AND user_id = ?", (tx_id, user_id)).fetchone()
            if not existing:
                return None

            fields = []
            params = []
            field_map = {
                "type": "type",
                "amount": "amount",
                "categoryId": "category_id",
                "accountId": "account_id",
                "toAccountId": "to_account_id",
                "date": "date",
                "time": "time",
                "note": "note",
                "descriptionDetail": "description_detail",
                "merchant": "merchant",
                "status": "status",
            }

            for key, col in field_map.items():
                if key in updates:
                    fields.append(f"{col} = ?")
                    params.append(updates[key])

            if "tags" in updates:
                fields.append("tags = ?")
                params.append(json.dumps(updates["tags"]))

            if fields:
                params.extend([tx_id, user_id])
                conn.execute(f"UPDATE transactions SET {', '.join(fields)} WHERE id = ? AND user_id = ?", params)

            row = conn.execute("SELECT * FROM transactions WHERE id = ? AND user_id = ?", (tx_id, user_id)).fetchone()
            return {
                "id": row["id"],
                "type": row["type"],
                "amount": row["amount"],
                "categoryId": row["category_id"],
                "accountId": row["account_id"],
                "toAccountId": row["to_account_id"] or None,
                "date": row["date"],
                "time": row["time"] or None,
                "note": row["note"],
                "descriptionDetail": row["description_detail"] or None,
                "merchant": row["merchant"] or None,
                "tags": json.loads(row["tags"]) if row["tags"] else [],
                "status": row["status"],
            }

    def delete_transaction(self, tx_id: str, user_id: str = "user-default") -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM transactions WHERE id = ? AND user_id = ?", (tx_id, user_id))
            return cursor.rowcount > 0

    def bulk_delete_transactions(self, tx_ids: List[str], user_id: str = "user-default") -> int:
        if not tx_ids:
            return 0
        with self.get_connection() as conn:
            placeholders = ",".join("?" for _ in tx_ids)
            cursor = conn.execute(
                f"DELETE FROM transactions WHERE user_id = ? AND id IN ({placeholders})",
                [user_id, *tx_ids]
            )
            return cursor.rowcount

    # ------------------------------------------------------------------
    # Accounts CRUD
    # ------------------------------------------------------------------
    def add_account(self, acc_data: Dict[str, Any], user_id: str = "user-default") -> Dict[str, Any]:
        acc_id = acc_data.get("id") or f"acc-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        with self.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO accounts (id, user_id, name, type, opening_balance, account_number, color, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    acc_id,
                    user_id,
                    acc_data["name"],
                    acc_data["type"],
                    int(acc_data.get("openingBalance", 0)),
                    acc_data.get("accountNumber", ""),
                    acc_data.get("color", "#065f46"),
                    now,
                )
            )
        return {
            "id": acc_id,
            "name": acc_data["name"],
            "type": acc_data["type"],
            "openingBalance": int(acc_data.get("openingBalance", 0)),
            "accountNumber": acc_data.get("accountNumber"),
            "color": acc_data.get("color", "#065f46"),
        }

    def update_account(self, acc_id: str, updates: Dict[str, Any], user_id: str = "user-default") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            fields = []
            params = []
            if "name" in updates:
                fields.append("name = ?")
                params.append(updates["name"])
            if "type" in updates:
                fields.append("type = ?")
                params.append(updates["type"])
            if "openingBalance" in updates:
                fields.append("opening_balance = ?")
                params.append(int(updates["openingBalance"]))
            if "accountNumber" in updates:
                fields.append("account_number = ?")
                params.append(updates["accountNumber"])
            if "color" in updates:
                fields.append("color = ?")
                params.append(updates["color"])

            if fields:
                params.extend([acc_id, user_id])
                conn.execute(f"UPDATE accounts SET {', '.join(fields)} WHERE id = ? AND user_id = ?", params)

            row = conn.execute("SELECT * FROM accounts WHERE id = ? AND user_id = ?", (acc_id, user_id)).fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "name": row["name"],
                "type": row["type"],
                "openingBalance": row["opening_balance"],
                "accountNumber": row["account_number"] or None,
                "color": row["color"] or None,
            }

    def delete_account(self, acc_id: str, user_id: str = "user-default") -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM accounts WHERE id = ? AND user_id = ?", (acc_id, user_id))
            return cursor.rowcount > 0

    def transfer_between_accounts(
        self, from_id: str, to_id: str, amount: int, note: str = "Account Transfer", user_id: str = "user-default"
    ) -> Dict[str, Any]:
        tx_data = {
            "type": "transfer",
            "amount": amount,
            "accountId": from_id,
            "toAccountId": to_id,
            "categoryId": "",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "note": note,
            "tags": ["transfer"],
        }
        return self.add_transaction(tx_data, user_id)

    # ------------------------------------------------------------------
    # Categories CRUD
    # ------------------------------------------------------------------
    def add_category(self, cat_data: Dict[str, Any], user_id: str = "user-default") -> Dict[str, Any]:
        cat_id = cat_data.get("id") or f"cat-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        with self.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO categories (id, user_id, name, icon, color, type, is_archived, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 0, ?)
                """,
                (cat_id, user_id, cat_data["name"], cat_data.get("icon", "Tag"), cat_data.get("color", "#10b981"), cat_data["type"], now)
            )
        return {
            "id": cat_id,
            "name": cat_data["name"],
            "icon": cat_data.get("icon", "Tag"),
            "color": cat_data.get("color", "#10b981"),
            "type": cat_data["type"],
            "isArchived": False,
        }

    def update_category(self, cat_id: str, updates: Dict[str, Any], user_id: str = "user-default") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            fields = []
            params = []
            if "name" in updates:
                fields.append("name = ?")
                params.append(updates["name"])
            if "icon" in updates:
                fields.append("icon = ?")
                params.append(updates["icon"])
            if "color" in updates:
                fields.append("color = ?")
                params.append(updates["color"])
            if "type" in updates:
                fields.append("type = ?")
                params.append(updates["type"])
            if "isArchived" in updates:
                fields.append("is_archived = ?")
                params.append(1 if updates["isArchived"] else 0)

            if fields:
                params.extend([cat_id, user_id])
                conn.execute(f"UPDATE categories SET {', '.join(fields)} WHERE id = ? AND user_id = ?", params)

            row = conn.execute("SELECT * FROM categories WHERE id = ? AND user_id = ?", (cat_id, user_id)).fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "name": row["name"],
                "icon": row["icon"],
                "color": row["color"],
                "type": row["type"],
                "isArchived": bool(row["is_archived"]),
            }

    def delete_category(self, cat_id: str, user_id: str = "user-default") -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM categories WHERE id = ? AND user_id = ?", (cat_id, user_id))
            return cursor.rowcount > 0

    # ------------------------------------------------------------------
    # Budgets CRUD
    # ------------------------------------------------------------------
    def set_budget(self, budget_data: Dict[str, Any], user_id: str = "user-default") -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        cat_id = budget_data["categoryId"]
        limit = int(budget_data["monthlyLimit"])
        with self.get_connection() as conn:
            existing = conn.execute("SELECT id FROM budgets WHERE user_id = ? AND category_id = ?", (user_id, cat_id)).fetchone()
            b_id = existing["id"] if existing else (budget_data.get("id") or f"b-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}")
            conn.execute(
                """
                INSERT OR REPLACE INTO budgets (id, user_id, category_id, monthly_limit, subtitle, daily_allowance, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (b_id, user_id, cat_id, limit, budget_data.get("subtitle"), budget_data.get("dailyAllowance"), now)
            )
        return {
            "id": b_id,
            "categoryId": cat_id,
            "monthlyLimit": limit,
            "subtitle": budget_data.get("subtitle"),
            "dailyAllowance": budget_data.get("dailyAllowance"),
        }

    def delete_budget(self, budget_id: str, user_id: str = "user-default") -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM budgets WHERE id = ? AND user_id = ?", (budget_id, user_id))
            return cursor.rowcount > 0

    # ------------------------------------------------------------------
    # Goals CRUD
    # ------------------------------------------------------------------
    def add_goal(self, goal_data: Dict[str, Any], user_id: str = "user-default") -> Dict[str, Any]:
        goal_id = goal_data.get("id") or f"g-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"
        now = datetime.now(timezone.utc).isoformat()
        with self.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO goals (
                    id, user_id, name, subtitle, target_amount, saved_amount,
                    target_date, color, priority, monthly_contribution, funding_method, pace_status_text, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    goal_id,
                    user_id,
                    goal_data["name"],
                    goal_data.get("subtitle"),
                    int(goal_data["targetAmount"]),
                    int(goal_data.get("savedAmount", 0)),
                    goal_data["targetDate"],
                    goal_data.get("color", "#065f46"),
                    goal_data.get("priority", "MEDIUM"),
                    goal_data.get("monthlyContribution"),
                    goal_data.get("fundingMethod"),
                    goal_data.get("paceStatusText"),
                    now,
                )
            )
        return {
            "id": goal_id,
            **goal_data,
            "savedAmount": int(goal_data.get("savedAmount", 0)),
        }

    def update_goal(self, goal_id: str, updates: Dict[str, Any], user_id: str = "user-default") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            fields = []
            params = []
            field_map = {
                "name": "name",
                "subtitle": "subtitle",
                "targetAmount": "target_amount",
                "savedAmount": "saved_amount",
                "targetDate": "target_date",
                "color": "color",
                "priority": "priority",
                "monthlyContribution": "monthly_contribution",
                "fundingMethod": "funding_method",
                "paceStatusText": "pace_status_text",
            }
            for key, col in field_map.items():
                if key in updates:
                    fields.append(f"{col} = ?")
                    params.append(updates[key])

            if fields:
                params.extend([goal_id, user_id])
                conn.execute(f"UPDATE goals SET {', '.join(fields)} WHERE id = ? AND user_id = ?", params)

            row = conn.execute("SELECT * FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id)).fetchone()
            if not row:
                return None
            return {
                "id": row["id"],
                "name": row["name"],
                "subtitle": row["subtitle"],
                "targetAmount": row["target_amount"],
                "savedAmount": row["saved_amount"],
                "targetDate": row["target_date"],
                "color": row["color"],
                "priority": row["priority"],
            }

    def contribute_to_goal(
        self, goal_id: str, amount: int, account_id: Optional[str] = None, user_id: str = "user-default"
    ) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            goal = conn.execute("SELECT * FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id)).fetchone()
            if not goal:
                return None

            new_saved = goal["saved_amount"] + amount
            conn.execute("UPDATE goals SET saved_amount = ? WHERE id = ? AND user_id = ?", (new_saved, goal_id, user_id))

            # Automatically log a contribution expense transaction if accountId is provided
            if account_id:
                tx_id = f"tx-goal-{int(time.time() * 1000)}-{uuid.uuid4().hex[:4]}"
                now = datetime.now(timezone.utc).isoformat()
                conn.execute(
                    """
                    INSERT INTO transactions (
                        id, user_id, type, amount, category_id, account_id,
                        date, time, note, tags, status, created_at
                    ) VALUES (?, ?, 'expense', ?, 'cat-investment', ?, ?, ?, ?, ?, 'Completed', ?)
                    """,
                    (
                        tx_id,
                        user_id,
                        amount,
                        account_id,
                        datetime.now().strftime("%Y-%m-%d"),
                        datetime.now().strftime("%I:%M %p"),
                        f"Goal Deposit: {goal['name']}",
                        json.dumps(["goal", "savings"]),
                        now,
                    )
                )

            return {
                "id": goal["id"],
                "name": goal["name"],
                "savedAmount": new_saved,
                "targetAmount": goal["target_amount"],
            }

    def delete_goal(self, goal_id: str, user_id: str = "user-default") -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id))
            return cursor.rowcount > 0

    # ------------------------------------------------------------------
    # Mandates, Settings, Notifications, Reset & Clear
    # ------------------------------------------------------------------
    def toggle_mandate(self, mandate_id: str, user_id: str = "user-default") -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT * FROM mandates WHERE id = ? AND user_id = ?", (mandate_id, user_id)).fetchone()
            if not row:
                return None
            new_status = "Paused" if row["status"] == "Active" else "Active"
            conn.execute("UPDATE mandates SET status = ? WHERE id = ? AND user_id = ?", (new_status, mandate_id, user_id))
            return {
                "id": row["id"],
                "goalName": row["goal_name"],
                "status": new_status,
            }

    def mark_notifications_read(self, user_id: str = "user-default") -> int:
        with self.get_connection() as conn:
            cursor = conn.execute("UPDATE notifications SET is_unread = 0 WHERE user_id = ?", (user_id,))
            return cursor.rowcount

    def update_settings(self, updates: Dict[str, Any], user_id: str = "user-default") -> Dict[str, Any]:
        with self.get_connection() as conn:
            existing = conn.execute("SELECT * FROM settings WHERE user_id = ?", (user_id,)).fetchone()
            currency = updates.get("currency") or (existing["currency"] if existing else "INR")
            theme = updates.get("theme") or (existing["theme"] if existing else "light")
            month_start_day = updates.get("monthStartDay") or (existing["month_start_day"] if existing else 1)
            user_name = updates.get("userName") or (existing["user_name"] if existing else "FinTrack User")
            user_email = updates.get("userEmail") or (existing["user_email"] if existing else "user@fintrack.io")
            now = datetime.now(timezone.utc).isoformat()

            conn.execute(
                """
                INSERT OR REPLACE INTO settings (user_id, currency, theme, month_start_day, user_name, user_email, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, currency, theme, month_start_day, user_name, user_email, now)
            )

            return {
                "currency": currency,
                "theme": theme,
                "monthStartDay": month_start_day,
                "userName": user_name,
                "userEmail": user_email,
            }

    def clear_all(self, user_id: str = "user-default"):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM accounts WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM budgets WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM goals WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM mandates WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))

            # Reseed default categories and accounts so user can immediately record transactions
            self.seed_default_categories(conn, user_id)
            self.seed_default_accounts(conn, user_id)
