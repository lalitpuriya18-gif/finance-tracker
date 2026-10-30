"""
==============================================================================
FinTrack — Bank SMS & Email Alert Parser Test Suite
==============================================================================
Unit and integration tests for regex extraction, merchant normalization,
category heuristics, account mask matching, and API endpoint committing.
==============================================================================
"""

import pytest
from backend.database import Database
from backend.app import create_app
from backend.sms_parser import (
    extract_amount,
    extract_type,
    extract_account_mask,
    extract_merchant,
    auto_categorize,
    parse_single_sms,
    parse_multi_sms,
)


@pytest.fixture
def client():
    """Isolated test client with in-memory SQLite database."""
    db = Database(":memory:")
    app = create_app(db)
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_regex_extract_amount():
    assert extract_amount("Sent Rs. 450.00 to Swiggy") == 450.0
    assert extract_amount("INR 2,499.50 debited from A/C *8921") == 2499.50
    assert extract_amount("Spent ₹ 120 at Chai Point") == 120.0
    assert extract_amount("Payment of $45.99 completed") == 45.99


def test_regex_extract_type():
    assert extract_type("Sent Rs. 450 to Swiggy") == "expense"
    assert extract_type("INR 1,200 debited from A/C") == "expense"
    assert extract_type("Rs 85,000 credited to your account") == "income"
    assert extract_type("Refund of Rs 250 added to wallet") == "income"


def test_regex_extract_account_mask():
    assert extract_account_mask("from HDFC Bank A/C *8921") == "8921"
    assert extract_account_mask("Card ending 4092 spent on Amazon") == "4092"
    assert extract_account_mask("Acct XX9902 debited with INR 500") == "9902"


def test_regex_extract_merchant_and_category():
    m1 = extract_merchant("Sent Rs. 450 to SWIGGY on 30-Oct-23")
    assert "Swiggy" in m1
    assert auto_categorize(m1, "Sent Rs. 450 to SWIGGY", "expense") == "cat-food"

    m2 = extract_merchant("INR 380 debited at UBER INDIA on 30-Oct-23")
    assert "Uber" in m2
    assert auto_categorize(m2, "INR 380 debited at UBER INDIA", "expense") == "cat-transport"

    m3 = extract_merchant("Salary credited by TECH CORP on 30-Oct-23")
    assert auto_categorize(m3, "Salary credited", "income") == "cat-income"


def test_parse_real_hdfc_sms():
    sms = "Sent Rs. 450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. UPI Ref 330412849201."
    accounts = [{"id": "acc-primary-bank", "accountNumber": "..8921"}]
    res = parse_single_sms(sms, accounts)

    assert res is not None
    assert res["amount"] == 450.0
    assert res["type"] == "expense"
    assert "Swiggy" in res["payee"]
    assert res["accountId"] == "acc-primary-bank"
    assert res["categoryId"] == "cat-food"
    assert res["date"] == "2023-10-30"


def test_parse_real_salary_credit_sms():
    sms = "Salary of INR 85,000.00 credited to A/C ..8921 on 30-OCT-23 by TECH CORP PVT LTD. Avail Bal: INR 1,20,400.00."
    accounts = [{"id": "acc-primary-bank", "accountNumber": "..8921"}]
    res = parse_single_sms(sms, accounts)

    assert res is not None
    assert res["amount"] == 85000.0
    assert res["type"] == "income"
    assert res["categoryId"] == "cat-income"
    assert res["accountId"] == "acc-primary-bank"


def test_parse_multi_sms_batch():
    multi_sms = """
    Sent Rs. 450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. UPI Ref 330412849201.

    INR 2,499.00 spent on your Card ending 4092 at AMAZON INDIA on 29-Oct-23.

    Salary of INR 85,000.00 credited to A/C ..8921 on 30-OCT-23 by TECH CORP.
    """
    accounts = [
        {"id": "acc-primary-bank", "accountNumber": "..8921"},
        {"id": "acc-credit-card", "accountNumber": "..4092"},
    ]
    parsed_list = parse_multi_sms(multi_sms, accounts)
    assert len(parsed_list) == 3
    assert parsed_list[0]["amount"] == 450.0
    assert parsed_list[1]["amount"] == 2499.0
    assert parsed_list[2]["amount"] == 85000.0


def test_api_sms_parser_and_confirm(client):
    # 1. Test POST /api/parser/sms
    sample_text = "Sent Rs. 650.00 from HDFC Bank A/C *8921 to ZOMATO on 30-OCT-23."
    parse_res = client.post("/api/parser/sms", json={"text": sample_text})
    assert parse_res.status_code == 200
    data = parse_res.get_json()
    assert data["success"] is True
    assert data["count"] == 1
    candidate = data["parsed"][0]
    assert candidate["amount"] == 650.0
    assert "Zomato" in candidate["payee"]

    # 2. Test POST /api/parser/sms/confirm (Commit to SQLite)
    confirm_res = client.post("/api/parser/sms/confirm", json={"transactions": [candidate]})
    assert confirm_res.status_code == 201
    confirm_data = confirm_res.get_json()
    assert confirm_data["success"] is True
    assert confirm_data["count"] == 1

    # 3. Verify transaction now exists in SQLite ledger
    ledger_res = client.get("/api/transactions")
    assert ledger_res.status_code == 200
    ledger_items = ledger_res.get_json()
    assert len(ledger_items) == 1
    assert ledger_items[0]["amount"] == 650.0
