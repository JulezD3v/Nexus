import os
import json
import cv2
from src.preprocess import apply_clahe
from src.ocr_engine import extract_card_metadata
from src.matcher import evaluate_voucher_legitimacy

def run_test_on_image(image_filename, db_records):
    sample_img_path = os.path.join("data", "raw", image_filename)
    if not os.path.exists(sample_img_path):
        print(f"\n❌ Skipping {image_filename} - File not found.")
        return

    print(f"\n\n=======================================================")
    print(f"🔍 TESTING PHYSICAL IMAGE: {image_filename}")
    print(f"=======================================================")
    
    with open(sample_img_path, "rb") as f:
        image_bytes = f.read()

    processed_img = apply_clahe(image_bytes)
    extracted_metadata = extract_card_metadata(processed_img)

    print("\n📊 EXTRACTED METADATA & CONFIDENCE SCORES:")
    print(json.dumps(extracted_metadata, indent=2))

    print("\n⚖️ RUNNING POSITIONAL MATCHER...")
    evaluation = evaluate_voucher_legitimacy(extracted_metadata, db_records)

    print("\n✅ FINAL DECISION:")
    print(json.dumps(evaluation, indent=2))

def run_all_tests():
    # Adding 'expiry_date' to our mock DB based on your request!
    mock_db_records = [
        {
            "serial_number": "2506200057796095", # Media.jpg True Serial
            "true_pin": "8517999953175012", 
            "status": "unused",
            "amount": 250,
            "expiry_date": "20-06-2027",
            "batch_id": "B-410"
        },
        {
            "serial_number": "2512020046896530", # sample.jpg True Serial
            "true_pin": "6274673814584384", 
            "status": "unused",
            "amount": 50,
            "expiry_date": "02-12-2027",
            "batch_id": "B-112"
        }
    ]

    # Test 1: The Overscratched Card
    run_test_on_image("overscratched_sample.jpg", mock_db_records)
    
    # Test 2: The Perfect Card
    run_test_on_image("sample.jpg", mock_db_records)

if __name__ == "__main__":
    run_all_tests()