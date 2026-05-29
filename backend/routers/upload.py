from fastapi import APIRouter, File, HTTPException, UploadFile

from db.supabase import get_supabase
from services.embeddings import store_embeddings
from services.extraction import extract_structured_info
from services.parser import parse_file

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".csv", ".md"}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = "." + file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type '{ext}' not supported. Use PDF, TXT, or CSV.")

    file_bytes = await file.read()
    supabase = get_supabase()

    raw_text = parse_file(file.filename, file_bytes)
    if not raw_text.strip():
        raise HTTPException(422, "Could not extract text from the file.")

    extracted = extract_structured_info(raw_text)

    patient_result = (
        supabase.table("patients")
        .insert(
            {
                "name": extracted.get("patient_name") or "Unknown Patient",
                "age": extracted.get("age"),
                "gender": extracted.get("gender"),
                "medical_specialty": extracted.get("medical_specialty"),
            }
        )
        .execute()
    )
    patient_id = patient_result.data[0]["id"]

    doc_result = (
        supabase.table("documents")
        .insert(
            {
                "patient_id": patient_id,
                "file_name": file.filename,
                "raw_text": raw_text,
            }
        )
        .execute()
    )
    document_id = doc_result.data[0]["id"]

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

    return {"patient_id": patient_id, "message": "File processed successfully"}
