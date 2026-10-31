"""
==============================================================================
FinTrack — Standalone Test Script for Background SMS Webhook
==============================================================================
This simple, zero-dependency Python script simulates an Android mobile phone
or SMS Forwarder app sending a bank debit alert to FinTrack's background webhook:
    POST http://127.0.0.1:5000/api/webhook/sms

Run this in your terminal:
    python backend/send_test_sms.py
==============================================================================
"""

import os
import json
import sys
import urllib.request
import urllib.error

# Sample real-world bank alert SMS
DEFAULT_SMS = (
    "Sent Rs.450.00 from HDFC Bank A/C *8921 to SWIGGY on 30-OCT-23. "
    "UPI Ref 329012345678. Not you? Call 18002583838."
)

DEFAULT_URL = f"{os.environ.get('BACKEND_URL', 'http://127.0.0.1:5000').rstrip('/')}/api/webhook/sms"


def send_test_sms(url: str = DEFAULT_URL, sms_text: str = DEFAULT_SMS):
    print("=" * 70)
    print("FinTrack — Background SMS Webhook Simulator")
    print("=" * 70)
    print(f"[*] Target URL : {url}")
    print(f"[*] Message    : {sms_text}")
    print("-" * 70)

    payload = json.dumps({"text": sms_text}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "FinTrack-MobileForwarder/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.getcode()
            response_body = response.read().decode("utf-8")
            result = json.loads(response_body)
            print(f"[OK] Success! Server HTTP {status_code}")
            print(f"[*] Response:\n{json.dumps(result, indent=2)}")
            print("-" * 70)
            if result.get("status") == "recorded":
                print("[OK] Transaction successfully captured and logged into SQLite ledger!")
            elif result.get("status") == "duplicate":
                print("[!] Transaction was already logged in SQLite (duplicate ignored).")
            else:
                print(f"[*] Result status: {result.get('status')}")
            return result
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[!] Server Error ({e.code}): {error_body}")
        return None
    except urllib.error.URLError as e:
        print(f"[X] Connection Error: {e.reason}")
        print("    Make sure the FinTrack Flask server is running (python backend/app.py)!")
        return None


if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    sample_text = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_SMS
    send_test_sms(target_url, sample_text)
