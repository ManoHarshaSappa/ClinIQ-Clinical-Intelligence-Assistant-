"""
Re-embed all patients by adding structured data chunks (medications, allergies, labs)
so similarity search also finds enriched information.

Run:
  cd backend && source .venv/bin/activate
  python scripts/reembed_enriched.py
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv; load_dotenv()

from db.supabase import get_supabase
from services.embeddings import embed_texts


def build_structured_text(p: dict, info: dict) -> str:
    """Convert extracted_info into a rich text chunk for embedding."""
    medications = info.get("medications") or []
    allergies   = info.get("allergies") or []
    diagnoses   = info.get("diagnoses") or []
    labs        = info.get("lab_results") or []
    summary     = info.get("summary_text") or ""

    parts = [
        f"Patient: {p.get('name')}, {p.get('age')} years old, {p.get('gender')}",
        f"Medical specialty: {p.get('medical_specialty')}",
    ]

    if summary:
        parts.append(f"Clinical summary: {summary}")

    if diagnoses:
        parts.append("Diagnoses: " + ", ".join(diagnoses))

    if medications:
        parts.append("Current medications: " + "; ".join(medications))

    if allergies:
        parts.append("Known allergies: " + "; ".join(allergies))

    if labs:
        lab_strs = [
            f"{lr.get('test')}: {lr.get('value')} {lr.get('unit')} ({lr.get('date','')})"
            for lr in labs
        ]
        parts.append("Lab results: " + "; ".join(lab_strs))

    return "\n".join(parts)


def run():
    sb = get_supabase()

    all_patients  = {p["id"]: p for p in sb.table("patients").select("*").execute().data}
    all_extracted = sb.table("extracted_info").select("*").execute().data
    all_docs      = {d["patient_id"]: d["id"] for d in sb.table("documents").select("patient_id, id").execute().data}

    print(f"Re-embedding structured data for {len(all_extracted)} patients...\n")

    for i, info in enumerate(all_extracted):
        pid = info["patient_id"]
        patient = all_patients.get(pid, {})
        doc_id  = all_docs.get(pid, "00000000-0000-0000-0000-000000000000")
        name = patient.get("name", "Unknown")

        # Build the structured text chunk
        structured_text = build_structured_text(patient, info)
        if not structured_text.strip():
            print(f"[{i+1}] {name} — skipped (empty)")
            continue

        # Check if structured chunk already exists (avoid duplicates)
        existing = (
            sb.table("embeddings")
            .select("id")
            .eq("patient_id", pid)
            .like("chunk_text", "%Current medications%")
            .execute()
        )
        if existing.data:
            print(f"[{i+1}] {name} — already has structured embedding, skipping")
            continue

        # Generate embedding and store
        try:
            vector = embed_texts([structured_text])[0]
            sb.table("embeddings").insert({
                "patient_id": pid,
                "document_id": doc_id,
                "chunk_text": structured_text,
                "embedding": vector,
            }).execute()
            print(f"[{i+1}] {name} — ✓ embedded")
        except Exception as e:
            print(f"[{i+1}] {name} — ✗ error: {e}")

    print(f"\nDone.")


if __name__ == "__main__":
    run()
