from fastapi import APIRouter, HTTPException

from db.supabase import get_supabase
from services.extraction import extract_structured_info

router = APIRouter()


@router.post("/extract/{patient_id}")
def re_extract(patient_id: str):
    """Re-run GPT-4o extraction on a patient's latest document."""
    supabase = get_supabase()

    docs = (
        supabase.table("documents")
        .select("*")
        .eq("patient_id", patient_id)
        .order("uploaded_at", desc=True)
        .execute()
    )
    if not docs.data:
        raise HTTPException(404, "No documents found for this patient")

    latest = docs.data[0]
    extracted = extract_structured_info(latest["raw_text"])

    supabase.table("extracted_info").upsert(
        {
            "patient_id": patient_id,
            "medications": extracted.get("medications", []),
            "allergies": extracted.get("allergies", []),
            "diagnoses": extracted.get("diagnoses", []),
            "lab_results": extracted.get("lab_results", []),
            "summary_text": extracted.get("summary_text", ""),
        }
    ).execute()

    return {"message": "Re-extraction complete", "data": extracted}
