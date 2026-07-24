import easyocr
import numpy as np
import ssl
import re

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

print("Loading optimized EasyOCR Model into memory...")
reader = easyocr.Reader(['en'], gpu=False)

def extract_card_metadata(processed_img: np.ndarray, min_confidence: float = 0.35) -> dict:
    results = reader.readtext(processed_img, allowlist='0123456789-. ')
    
    raw_blocks = []
    for (bbox, text, prob) in results:
        if prob >= min_confidence:
            # Parse bounding box points for geometric math
            x_min = min([pt[0] for pt in bbox])
            x_max = max([pt[0] for pt in bbox])
            y_min = min([pt[1] for pt in bbox])
            
            cleaned_text = text.strip()
            raw_blocks.append({
                "x_min": x_min, "x_max": x_max, "y_min": y_min,
                "text": cleaned_text, "prob": float(prob)
            })

    metadata = {"extracted_pin": None, "pin_confidence": 0.0, "extracted_serial": None, "serial_confidence": 0.0, "extracted_expiry": None, "expiry_confidence": 0.0}

    # Relaxed Regex using Capture Groups to catch dates even with missing separators, mashed digits, or noise
    expiry_pattern = re.compile(r'(\d{2})[\.\- ]*(\d{2})[\.\- ]*(202\d|203\d)')
    numeric_candidates = []

    for block in raw_blocks:
        txt = block["text"]
        
        # 1. Expiry Date Match
        expiry_match = expiry_pattern.search(txt)
        if expiry_match:
            # Reconstruct the date cleanly from the regex capture groups (Day, Month, Year)
            day, month, year = expiry_match.groups()
            metadata["extracted_expiry"] = f"{day}-{month}-{year}"
            metadata["expiry_confidence"] = block["prob"]
            continue

        digit_only_str = re.sub(r'[^0-9]', '', txt)
        
        if len(digit_only_str) > 0:
            block["digit_count"] = len(digit_only_str)
            block["digit_only"] = digit_only_str
            numeric_candidates.append(block)

    # 2. Extract Serial Number (Must be 15 or 16 digits, usually at the bottom)
    serials = [c for c in numeric_candidates if 15 <= c["digit_count"] <= 16]
    serial_y_min = 0 # Track the horizontal line of the serial number
    
    if len(serials) >= 1:
        serials.sort(key=lambda x: x["y_min"], reverse=True) # Lowest physically on the card
        metadata["extracted_serial"] = serials[0]["digit_only"]
        metadata["serial_confidence"] = serials[0]["prob"]
        serial_y_min = serials[0]["y_min"]
        
        # Remove it from candidates
        numeric_candidates = [c for c in numeric_candidates if c["digit_only"] != metadata["extracted_serial"]]

    # 3. Geometric PIN Reconstruction
    pin_fragments = []
    for cand in numeric_candidates:
        # SPATIAL FILTER: Exclude any blocks that sit on the same bottom line as the Serial Number
        # (This prevents misread Expiry dates from gluing onto the PIN)
        if serial_y_min > 0 and cand["y_min"] > (serial_y_min - 30):
            continue 
            
        if 3 <= cand["digit_count"] <= 16:
            pin_fragments.append(cand)

    if pin_fragments:
        # Sort fragments left-to-right
        pin_fragments.sort(key=lambda x: x["x_min"])
        
        # Calculate average physical width of a single character on the card
        total_chars = sum([frag["digit_count"] for frag in pin_fragments])
        total_width = sum([frag["x_max"] - frag["x_min"] for frag in pin_fragments])
        avg_char_width = total_width / total_chars if total_chars > 0 else 15
        
        reconstructed_pin = ""
        total_prob = 0.0
        
        for i, frag in enumerate(pin_fragments):
            if i > 0:
                prev_frag = pin_fragments[i-1]
                # Calculate the pixel gap between the current block and previous block
                gap_pixels = frag["x_min"] - prev_frag["x_max"]
                
                # If the gap is wide enough to fit characters, inject asterisks!
                missing_chars = int(round(gap_pixels / avg_char_width))
                if missing_chars > 0:
                    reconstructed_pin += "*" * missing_chars
            
            reconstructed_pin += frag["digit_only"]
            total_prob += frag["prob"]
            
        # Ensure exact 16 length mapping
        reconstructed_pin = reconstructed_pin.ljust(16, '*')[0:16]

        metadata["extracted_pin"] = reconstructed_pin
        metadata["pin_confidence"] = total_prob / len(pin_fragments)

    return metadata

def extract_numbers(processed_img: np.ndarray, min_confidence: float = 0.35) -> list:
    results = reader.readtext(processed_img, allowlist='0123456789-. ')
    return [{"bounding_box": [[int(c) for c in pt] for pt in b], "text": t.strip(), "confidence": round(float(p), 4)} for (b, t, p) in results if p >= min_confidence]