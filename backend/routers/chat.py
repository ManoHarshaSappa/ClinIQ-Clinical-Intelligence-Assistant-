from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db.supabase import get_supabase
from services.embeddings import similarity_search
from services.rag import rag_answer

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    patient_id: Optional[str] = None


@router.post("/chat")
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(400, "Question cannot be empty")
    return rag_answer(request.question, request.patient_id)


@router.get("/search")
def search(q: str):
    if not q.strip():
        raise HTTPException(400, "Query cannot be empty")

    results = similarity_search(q, patient_id=None, top_k=10)

    # Enrich results with patient name + specialty
    if results:
        supabase = get_supabase()
        patient_ids = list({r["patient_id"] for r in results})
        patients_data = (
            supabase.table("patients")
            .select("id, name, medical_specialty")
            .in_("id", patient_ids)
            .execute()
        )
        patient_map = {p["id"]: p for p in patients_data.data}
        for r in results:
            p = patient_map.get(r["patient_id"], {})
            r["patient_name"] = p.get("name", "Unknown")
            r["patient_specialty"] = p.get("medical_specialty")

    return {"results": results}
