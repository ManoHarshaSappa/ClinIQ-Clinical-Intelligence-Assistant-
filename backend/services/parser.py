import csv
import io
from pathlib import Path

import fitz  # PyMuPDF
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """PyMuPDF first (faster); falls back to pdfplumber for scanned PDFs."""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "\n".join(page.get_text() for page in doc)
        if text.strip():
            return text
    except Exception:
        pass

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def extract_text_from_csv(file_bytes: bytes) -> str:
    """Convert CSV rows to pipe-delimited plain text for embedding."""
    content = file_bytes.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))
    lines = []
    for row in reader:
        line = " | ".join(f"{k}: {v}" for k, v in row.items() if v)
        lines.append(line)
    return "\n".join(lines)


def parse_file(filename: str, file_bytes: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif suffix == ".csv":
        return extract_text_from_csv(file_bytes)
    elif suffix in (".txt", ".md"):
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {suffix}")
