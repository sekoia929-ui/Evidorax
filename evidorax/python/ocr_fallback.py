"""
EvidoraX — OCR fallback for scanned or pre-2000 PDFs.

The Node pipeline (pdf-parse) handles normal text PDFs. When a paper
yields very little extractable text — common for scanned journal
photocopies from the 1940s-1980s, exactly the era of your BCG trial
dataset — this script runs OCR and hands clean text back to the same
Stage 1 / Stage 2 / Pass 3 Claude pipeline.

Usage:
    python ocr_fallback.py path/to/paper.pdf > output.txt

Install:
    pip install pymupdf pytesseract pillow --break-system-packages
    (also requires the tesseract binary installed on the host)
"""

import sys
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io


def is_scanned(pdf_path, chars_per_page_threshold=100):
    """Quick check: does this PDF have a real text layer, or is it images?"""
    doc = fitz.open(pdf_path)
    total_chars = sum(len(page.get_text()) for page in doc)
    avg_chars = total_chars / max(doc.page_count, 1)
    doc.close()
    return avg_chars < chars_per_page_threshold


def ocr_pdf(pdf_path, dpi=300):
    """Render each page to an image and OCR it."""
    doc = fitz.open(pdf_path)
    full_text = []

    for page_num, page in enumerate(doc, start=1):
        pix = page.get_pixmap(dpi=dpi)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        page_text = pytesseract.image_to_string(img)
        full_text.append(f"\n--- PAGE {page_num} ---\n{page_text}")

    doc.close()
    return "\n".join(full_text)


def extract_text(pdf_path):
    """Entry point: use text layer if present, OCR if scanned."""
    if is_scanned(pdf_path):
        sys.stderr.write(f"[EvidoraX] {pdf_path} appears scanned — running OCR\n")
        return ocr_pdf(pdf_path)
    else:
        doc = fitz.open(pdf_path)
        text = "\n".join(
            f"\n--- PAGE {i+1} ---\n{page.get_text()}"
            for i, page in enumerate(doc)
        )
        doc.close()
        return text


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python ocr_fallback.py path/to/paper.pdf")
        sys.exit(1)

    result = extract_text(sys.argv[1])
    print(result)
