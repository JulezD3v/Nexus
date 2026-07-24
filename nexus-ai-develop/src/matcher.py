# src/matcher.py
import re
from datetime import datetime

def parse_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, "%d-%m-%Y")
    except (ValueError, TypeError):
        return None

def resolve_wildcard_serial(user_serial: str, db_records: list) -> list:
    """
    FUZZY MATCHING LOGIC: Allows up to 3 OCR hallucinations/mistakes 
    when matching the 16-digit Serial Number against the database.
    """
    if not user_serial:
        return []

    matched_records = []
    user_len = len(user_serial)
    
    for record in db_records:
        db_serial = record["serial_number"]
        if abs(len(db_serial) - user_len) > 1:
            continue # Skip wildly different lengths
            
        # Count character differences (Hamming Distance)
        mismatches = 0
        for i in range(min(user_len, len(db_serial))):
            u_char = user_serial[i]
            if u_char not in ['*', '_', '.'] and u_char != db_serial[i]:
                mismatches += 1
                
        # If the OCR made 3 or fewer mistakes on the serial, we flag it as a candidate!
        if mismatches <= 3:
            matched_records.append(record)
            
    return matched_records

def verify_partial_pin(user_partial_pin: str, true_pin: str) -> float:
    if not user_partial_pin or not true_pin:
        return 0.0
    if len(user_partial_pin) != 16 or len(true_pin) != 16:
        return 0.0

    matches = 0
    comparable_slots = 0

    for i in range(16):
        user_char = user_partial_pin[i]
        if user_char in ['*', '_']:
            continue
        comparable_slots += 1
        if user_char == true_pin[i]:
            matches += 1

    return float(matches / comparable_slots) if comparable_slots > 0 else 0.0

def evaluate_voucher_legitimacy(extracted_data: dict, db_records: list) -> dict:
    user_serial = extracted_data.get("extracted_serial")
    if not user_serial:
         return {"status": "rejected", "reason": "Serial completely unreadable."}

    # FUZZY SEARCH
    candidates = resolve_wildcard_serial(user_serial, db_records)

    if not candidates:
        return {"status": "rejected", "reason": f"No serial records remotely matching '{user_serial}' found in Database."}

    best_match_record = None
    highest_score = 0.0
    extracted_pin = extracted_data.get("extracted_pin")

    for cand in candidates:
        score = verify_partial_pin(extracted_pin, cand["true_pin"])
        if score > highest_score:
            highest_score = score
            best_match_record = cand

    if not best_match_record:
        return {"status": "rejected", "reason": "PIN positional sequence does not match candidate records."}

    # DB EXPIRY VERIFICATION 
    db_expiry_str = best_match_record.get("expiry_date")
    extracted_expiry = extracted_data.get("extracted_expiry")
    
    if db_expiry_str:
        db_expiry = parse_date(db_expiry_str)
        if db_expiry and db_expiry < datetime.now():
            return {"status": "rejected", "reason": f"Database states voucher expired on {db_expiry_str}."}
        
        # If OCR caught the date, double check it matches the DB for extra security
        if extracted_expiry and extracted_expiry != db_expiry_str:
            pass # We could reject here, but OCR dates are often misread, so we rely on DB truth.

    if best_match_record.get("status") == "used":
        return {"status": "rejected", "reason": "Voucher already loaded. Transaction blocked."}

    readable_chars = sum(1 for c in extracted_pin if c not in ['*', '_'])

    if highest_score == 1.0 and readable_chars >= 5:
        return {
            "status": "approved",
            "message": "Voucher validated successfully!",
            "matched_serial": best_match_record["serial_number"],
            "direct_topup_payload": {
                "serial": best_match_record["serial_number"],
                "status_change": "used",
                "topup_amount": best_match_record.get("amount", 100)
            }
        }
    else:
        return {"status": "flagged", "reason": f"Mismatch found. Score: {highest_score*100:.1f}%, Visible Count: {readable_chars}"}