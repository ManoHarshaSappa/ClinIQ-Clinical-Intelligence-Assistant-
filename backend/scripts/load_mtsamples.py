"""Seed database with MTSamples records for demo/testing.

Usage:
  cd backend
  python scripts/load_mtsamples.py ../../data/mtsamples.csv --limit 10
"""
import argparse
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

from db.supabase import get_supabase
from services.embeddings import store_embeddings
from services.extraction import extract_structured_info


def load_mtsamples(csv_path: str, limit: int = 10, offset: int = 0) -> None:
    supabase = get_supabase()

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        loaded = 0

        for i, row in enumerate(reader):
            if i < offset:
                continue
            if loaded >= limit:
                break

            raw_text = row.get("transcription", "").strip()
            if not raw_text or len(raw_text) < 100:
                continue

            print(f"Processing row {i + 1}...")
            extracted = extract_structured_info(raw_text)

            patient = (
                supabase.table("patients")
                .insert(
                    {
                        "name": extracted.get("patient_name") or f"Sample Patient {i + 1}",
                        "age": extracted.get("age"),
                        "gender": extracted.get("gender"),
                        "medical_specialty": row.get("medical_specialty")
                        or extracted.get("medical_specialty"),
                    }
                )
                .execute()
            )
            patient_id = patient.data[0]["id"]

            doc = (
                supabase.table("documents")
                .insert(
                    {
                        "patient_id": patient_id,
                        "file_name": f"mtsample_{i + 1}.txt",
                        "raw_text": raw_text,
                    }
                )
                .execute()
            )
            document_id = doc.data[0]["id"]

            supabase.table("extracted_info").insert(
                {
                    "patient_id": patient_id,
                    "medications": extracted.get("medications", []),
                    "allergies": extracted.get("allergies", []),
                    "diagnoses": extracted.get("diagnoses", []),
                    "lab_results": extracted.get("lab_results", []),
                    "summary_text": extracted.get("summary_text", ""),
                }
            ).execute()

            store_embeddings(patient_id, document_id, raw_text)
            loaded += 1
            print(f"  ✓ Loaded patient {loaded}/{limit}: {patient_id}")

    print(f"\nDone. Loaded {loaded} patients.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", help="Path to mtsamples.csv")
    parser.add_argument("--limit", type=int, default=10, help="Max records to load")
    parser.add_argument("--offset", type=int, default=0, help="Skip first N rows")
    args = parser.parse_args()
    load_mtsamples(args.csv_path, args.limit, args.offset)
