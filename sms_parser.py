"""
==============================================================================
FinTrack — Bank SMS & Email Alert Regex Parsing Engine
==============================================================================
This module parses bank transaction alert messages (SMS / Email) from:
- Major Indian Banks: HDFC, ICICI, SBI, Axis, Kotak, PNB, etc.
- UPI & Wallets: Google Pay, PhonePe, Paytm, Cred, Amazon Pay
- International Bank alerts: Generic USD ($), EUR (€), GBP (£) notifications

Extracts:
1. Amount (cleaned to float)
2. Direction / Type (expense vs income)
3. Payee / Merchant / Entity name
4. Bank Account mask (*8921) and auto-matches to registered accounts
5. Transaction Date (standardized to YYYY-MM-DD)
6. Category Auto-Tagging via smart keyword heuristics
==============================================================================
"""

import re
from datetime import datetime
from typing import Dict, Any, List, Optional

# Keyword dictionary for smart category classification
CATEGORY_KEYWORD_RULES = [
    # Food & Dining
    (
        "cat-food",
        [
            "swiggy", "zomato", "starbucks", "mcdonald", "burger king", "kfc",
            "domino", "pizza", "blinkit", "zepto", "instamart", "cafe", "coffee",
            "restaurant", "bistro", "diner", "bakery", "subway", "haldiram"
        ]
    ),
    # Transport & Commute
    (
        "cat-transport",
        [
            "uber", "ola", "rapido", "metro", "fuel", "petrol", "diesel",
            "hpcl", "bpcl", "iocl", "shell", "fastag", "toll", "irctc",
            "flight", "indigo", "air india", "train", "parking"
        ]
    ),
    # Shopping & Lifestyle
    (
        "cat-shopping",
        [
            "amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "nykaa",
            "meesho", "decathlon", "tata cliq", "retail", "supermarket",
            "dmart", "reliance", "croma", "apple", "uniqlo", "lifestyle"
        ]
    ),
    # Entertainment
    (
        "cat-entertainment",
        [
            "netflix", "spotify", "hotstar", "prime video", "pvr", "inox",
            "bookmyshow", "cinema", "movie", "playstation", "steam", "youtube",
            "disney", "gaana", "wynk", "zee5", "gaming"
        ]
    ),
    # Bills & Utilities
    (
        "cat-bills",
        [
            "airtel", "jio", "vodafone", "vi", "bescom", "electricity", "gas",
            "water", "broadband", "act fibernet", "tata play", "dth", "recharge",
            "postpaid", "billdesk", "utility"
        ]
    ),
    # Health & Wellness
    (
        "cat-health",
        [
            "cult.fit", "cultfit", "gym", "apollo", "pharmeasy", "1mg",
            "hospital", "clinic", "pharmacy", "medplus", "dental", "doctor",
            "lab", "diagnostic", "fitness"
        ]
    ),
    # Investment
    (
        "cat-investment",
        [
            "zerodha", "groww", "coin", "angelone", "upstox", "sip",
            "mutual fund", "shares", "stock", "crypto", "binance", "wazirx", "uti", "hdfc mf"
        ]
    ),
    # Income & Credits
    (
        "cat-income",
        [
            "salary", "payroll", "bonus", "dividend", "interest", "refund",
            "cashback", "deposited by", "credited by", "received from"
        ]
    ),
]

# Month name mapping for date conversion (e.g. 30-OCT-23 -> 2023-10-30)
MONTH_MAP = {
    "jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06",
    "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"
}


def clean_amount(val_str: str) -> float:
    """Removes commas and symbols to convert amount strings to float."""
    cleaned = val_str.replace(",", "").strip()
    return float(cleaned)


def extract_amount(text: str) -> Optional[float]:
    """
    Extracts the monetary transaction amount from text.
    Handles INR, Rs, Rs., ₹, USD, EUR, etc.
    """
    patterns = [
        # Rs. 450.00 / INR 1,250.00 / ₹ 350
        r"(?:INR|Rs\.?|₹|\$|EUR|€)\s*([\d,]+(?:\.\d{1,2})?)",
        # 450.00 INR / 1250.00 Rs
        r"([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)",
        # "for Rs. 450.00" or "amount 450.00"
        r"(?:for|of|amount)\s+(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)",
        r"(?:for|of|amount)\s+([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)",
        r"(?:for|of|amount)\s+([\d,]+(?:\.\d{1,2})?)(?!\s*(?:min|minute|hour|day|sec|year|month))",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            try:
                amt = clean_amount(m.group(1))
                if amt > 0:
                    return amt
            except ValueError:
                continue
    return None


def extract_type(text: str) -> str:
    """
    Determines if the transaction is an outflow (expense) or inflow (income).
    """
    text_lower = text.lower()
    
    # Check for Credit / Income keywords first
    credit_keywords = ["credited", "credited to", "deposited", "received", "added to", "refund", "cashback", "salary"]
    for kw in credit_keywords:
        if kw in text_lower:
            return "income"

    # Default to expense if debit keywords match
    debit_keywords = ["debited", "spent", "sent", "paid", "withdrawn", "purchase", "dr"]
    for kw in debit_keywords:
        if kw in text_lower:
            return "expense"

    return "expense"


def extract_account_mask(text: str) -> Optional[str]:
    """
    Extracts bank account or card ending mask (e.g. *8921, XX4092, ..9902).
    """
    patterns = [
        r"(?:A/C|Acct|Account|Card ending|ending in|A/c no\.?|card)\s*(?:no\.?\s*)?[\*\.xX]*(\d{4})",
        r"[\*\.xX]{2,}(\d{4})",
        r"(?:ending|last)\s+(\d{4})",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


def extract_merchant(text: str) -> str:
    """
    Extracts the payee / merchant / entity name from transaction alert strings.
    """
    # 1. Match patterns like 'to SWIGGY', 'at UBER', 'towards AMAZON', 'by STARBUCKS'
    patterns = [
        r"(?:to|at|towards|by|info:|vpa:|for)\s+([A-Za-z0-9\.\s&-]{2,30}?)(?:\s+(?:on|avail|ref|upi|val|\.|\n|$))",
        r"spent\s+on\s+([A-Za-z0-9\.\s&-]{2,30}?)(?:\s+(?:on|avail|\.|\n|$))",
        r"paid\s+to\s+([A-Za-z0-9\.\s&-]{2,30}?)(?:\s+(?:on|avail|\.|\n|$))",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            candidate = m.group(1).strip()
            # Clean up unwanted words like 'UPI', 'Ref', 'a/c'
            candidate = re.sub(r"(?i)\b(upi|ref|a/c|card|account|inr|rs)\b.*", "", candidate).strip()
            if len(candidate) >= 2 and not candidate.isdigit():
                return candidate.title()

    # 2. Look for known prominent merchant names in the text
    text_lower = text.lower()
    for cat_id, keywords in CATEGORY_KEYWORD_RULES:
        for kw in keywords:
            if kw in text_lower and kw not in ["fuel", "bill", "recharge", "utility", "retail", "supermarket"]:
                return kw.title()

    return "Bank Transaction"


def extract_date(text: str) -> str:
    """
    Extracts transaction date or defaults to current date (YYYY-MM-DD).
    Handles:
    - 30-Oct-23 / 30-OCT-2023 / 30/10/2023
    - 2023-10-30
    """
    # 1. Match DD-Mon-YY or DD-Mon-YYYY (e.g. 30-OCT-23)
    m = re.search(r"\b(\d{1,2})[-/\s]([A-Za-z]{3})[-/\s](\d{2,4})\b", text)
    if m:
        day = m.group(1).zfill(2)
        month_str = m.group(2).lower()[:3]
        month = MONTH_MAP.get(month_str, "10")
        year = m.group(3)
        if len(year) == 2:
            year = "20" + year
        return f"{year}-{month}-{day}"

    # 2. Match DD/MM/YYYY or DD-MM-YYYY
    m = re.search(r"\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b", text)
    if m:
        day = m.group(1).zfill(2)
        month = m.group(2).zfill(2)
        year = m.group(3)
        if len(year) == 2:
            year = "20" + year
        return f"{year}-{month}-{day}"

    # Default to current local date
    return datetime.now().strftime("%Y-%m-%d")


def auto_categorize(payee: str, text: str, tx_type: str) -> str:
    """
    Determines category based on merchant name and alert text keywords.
    """
    if tx_type == "income":
        return "cat-income"

    search_blob = f"{payee} {text}".lower()
    for cat_id, keywords in CATEGORY_KEYWORD_RULES:
        for kw in keywords:
            if kw in search_blob:
                return cat_id

    # Default general categories
    return "cat-shopping" if tx_type == "expense" else "cat-income"


def match_account_id(mask: Optional[str], accounts: Optional[List[Dict[str, Any]]]) -> str:
    """
    Matches the 4-digit mask against registered accounts in SQLite.
    Falls back to the first available account or 'acc-primary-bank'.
    """
    if not accounts:
        return "acc-primary-bank"

    if mask:
        for acc in accounts:
            acc_num = acc.get("accountNumber") or ""
            if mask in acc_num:
                return acc["id"]

    return accounts[0]["id"] if accounts else "acc-primary-bank"


def is_otp_or_non_financial(text: str) -> bool:
    """
    Detects OTPs, 2-factor codes, password resets, and marketing SMS
    to avoid false positive transactions.
    """
    lower = text.lower()
    otp_words = ["otp", "verification code", "one time password", "secret code", "security code", "password reset"]
    if any(w in lower for w in otp_words):
        # Only treat as transaction if it explicitly mentions money debited or credited
        if not ("debited" in lower or "credited" in lower):
            return True
    return False


def parse_single_sms(text: str, accounts: Optional[List[Dict[str, Any]]] = None) -> Optional[Dict[str, Any]]:
    """
    Parses a single SMS or email notification string into a FinTrack transaction dictionary.
    Returns None if no valid monetary amount is detected or message is non-financial.
    """
    cleaned_text = text.strip()
    if not cleaned_text:
        return None

    if is_otp_or_non_financial(cleaned_text):
        return None

    amount = extract_amount(cleaned_text)
    if not amount:
        return None

    tx_type = extract_type(cleaned_text)
    mask = extract_account_mask(cleaned_text)
    payee = extract_merchant(cleaned_text)
    date_str = extract_date(cleaned_text)
    category_id = auto_categorize(payee, cleaned_text, tx_type)
    account_id = match_account_id(mask, accounts)

    return {
        "amount": amount,
        "type": tx_type,
        "payee": payee,
        "categoryId": category_id,
        "accountId": account_id,
        "accountMask": mask or "",
        "date": date_str,
        "rawText": cleaned_text,
        "notes": f"Auto-parsed from SMS alert: {payee}",
    }


def parse_multi_sms(text: str, accounts: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    """
    Splits multi-message text blocks and extracts all valid transactions.
    Supports pasting multiple SMS messages at once.
    """
    # Split text by double newlines or message start boundaries
    chunks = re.split(r"\n\s*\n|(?:\r?\n)+(?=(?:Dear\s+Customer|Sent\s+|INR\s+|Rs\.?\s*|\bAcct\b))", text.strip(), flags=re.IGNORECASE)
    
    results = []
    seen_hashes = set()

    for chunk in chunks:
        chunk = chunk.strip()
        if len(chunk) < 15:
            continue
        parsed = parse_single_sms(chunk, accounts)
        if parsed:
            # Prevent duplicate identical items in the same paste
            item_hash = f"{parsed['amount']}-{parsed['payee']}-{parsed['date']}"
            if item_hash not in seen_hashes:
                seen_hashes.add(item_hash)
                results.append(parsed)

    # If splitting didn't find multiple, try parsing the whole block
    if not results:
        single = parse_single_sms(text, accounts)
        if single:
            results.append(single)

    return results
