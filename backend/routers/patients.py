from fastapi import APIRouter, HTTPException

from db.supabase import get_supabase

router = APIRouter()


@router.get("/stats")
def get_stats():
    supabase = get_supabase()
    patients = supabase.table("patients").select("id, medical_specialty").execute()
    docs = supabase.table("documents").select("id", count="exact").execute()
    embeddings = supabase.table("embeddings").select("id", count="exact").execute()

    specialty_breakdown: dict = {}
    for p in patients.data:
        spec = p.get("medical_specialty") or "Unknown"
        specialty_breakdown[spec] = specialty_breakdown.get(spec, 0) + 1

    return {
        "total_patients": len(patients.data),
        "total_documents": docs.count or 0,
        "total_embeddings": embeddings.count or 0,
        "specialty_breakdown": specialty_breakdown,
    }


@router.get("/patients")
def list_patients():
    supabase = get_supabase()
    result = (
        supabase.table("patients").select("*").order("created_at", desc=True).execute()
    )
    patients = result.data

    # Enrich with allergy count from extracted_info
    if patients:
        patient_ids = [p["id"] for p in patients]
        extracted = (
            supabase.table("extracted_info")
            .select("patient_id, allergies")
            .in_("patient_id", patient_ids)
            .execute()
        )
        allergy_map = {
            r["patient_id"]: len(r.get("allergies") or [])
            for r in extracted.data
        }
        for p in patients:
            p["allergy_count"] = allergy_map.get(p["id"], 0)

    return patients


@router.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    supabase = get_supabase()

    patient = supabase.table("patients").select("*").eq("id", patient_id).execute()
    if not patient.data:
        raise HTTPException(404, "Patient not found")

    extracted = (
        supabase.table("extracted_info")
        .select("*")
        .eq("patient_id", patient_id)
        .execute()
    )
    documents = (
        supabase.table("documents")
        .select("id, file_name, uploaded_at")
        .eq("patient_id", patient_id)
        .execute()
    )

    return {
        "patient": patient.data[0],
        "extracted_info": extracted.data[0] if extracted.data else None,
        "documents": documents.data,
    }


@router.get("/documents/{document_id}/text")
def get_document_text(document_id: str):
    supabase = get_supabase()
    doc = supabase.table("documents").select("file_name, raw_text, uploaded_at").eq("id", document_id).execute()
    if not doc.data:
        raise HTTPException(404, "Document not found")
    return doc.data[0]
