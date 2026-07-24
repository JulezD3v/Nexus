# OpenCV Image Enhancement, Glare Filtering & Adaptive Thresholding

import cv2
import numpy as np

def apply_clahe(image_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes, converts to grayscale, and applies CLAHE 
    to mitigate extreme highlights/glare from silver scratch foil.
    """
    # 1. Convert raw bytes to a numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # 2. Decode the array into an OpenCV image matrix
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("CRITICAL: Failed to decode image bytes. Check file integrity.")

    # 3. Strip color (We only care about the contrast of black ink on silver)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 4. Apply CLAHE (The "Glare Killer")
    # clipLimit=2.0 prevents noise amplification, tileGridSize=(8,8) localizes contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 5. Mild Gaussian Blur (3x3 kernel) to smooth out "scratch dust" noise
    blurred = cv2.GaussianBlur(enhanced, (3, 3), 0)

    return blurred