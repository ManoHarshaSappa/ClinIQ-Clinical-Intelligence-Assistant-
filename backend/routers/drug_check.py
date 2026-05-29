import json
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

from db.supabase import get_supabase
from services.openfda import get_drug_summary

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DRUG_CHECK_PROMPT = """You are a clinical pharmacology AI with access to real FDA drug label data.
Using the FDA label information AND the patient's current medications and allergies,
evaluate the safety of adding a new drug.

Return ONLY a valid JSON object:
{
  "status": "safe|warning|danger",
  "summary": "1-2 sentence verdict on safety",
  "interactions": ["specific interaction 1", ...],
  "allergy_flags": ["allergy concern 1", ...],
  "recommendation": "Specific clinical recommendation for the prescribing doctor",
  "fda_source": true
}
- "danger"  = serious interaction, absolute contraindication, direct allergy match, or black box warning applies
- "warning" = potential interaction requiring monitoring or dose adjustment
- "safe"    = no significant concerns identified
Prioritize the FDA label data over general knowledge when both are available."""


class DrugCheckRequest(BaseModel):
    patient_id: str
    drug_name: str


@router.post("/drug-check")
def drug_check(request: DrugCheckRequest):
    supabase = get_supabase()

    extracted = (
        supabase.table("extracted_info")
        .select("medications, allergies, diagnoses")
        .eq("patient_id", request.patient_id)
        .execute()
    )
    if not extracted.data:
        raise HTTPException(404, "No medication data found for this patient")

    info = extracted.data[0]

    # Pull real FDA data
    drug_info = get_drug_summary(request.drug_name)
    fda = drug_info["fda_label"]
    normalized_name = drug_info["normalized_name"]

    # Build FDA context section
    fda_context = ""
    if fda.get("found"):
        parts = []
        if fda.get("boxed_warning"):
            parts.append(f"BLACK BOX WARNING: {fda['boxed_warning'][:600]}")
        if fda.get("contraindications"):
            parts.append(f"FDA CONTRAINDICATIONS: {fda['contraindications'][:600]}")
        if fda.get("drug_interactions"):
            parts.append(f"FDA DRUG INTERACTIONS: {fda['drug_interactions'][:600]}")
        if fda.get("warnings_and_cautions"):
            parts.append(f"FDA WARNINGS: {fda['warnings_and_cautions'][:400]}")
        fda_context = "\n\n".join(parts)
    else:
        fda_context = "FDA label data not available for this drug."

    context = f"""
Proposed new drug: {normalized_name} (entered as: {request.drug_name})

--- REAL FDA LABEL DATA ---
{fda_context}

--- PATIENT DATA ---
Current medications: {', '.join(info.get('medications') or [])}
Known allergies: {', '.join(info.get('allergies') or [])}
Active diagnoses: {', '.join(info.get('diagnoses') or [])}
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": DRUG_CHECK_PROMPT},
            {"role": "user", "content": context},
        ],
        temperature=0,
        max_tokens=600,
    )

    result = json.loads(response.choices[0].message.content)

    # Attach FDA metadata to response
    result["fda_found"] = fda.get("found", False)
    result["normalized_name"] = normalized_name
    result["brand_names"] = fda.get("brand_names", [])
    result["has_boxed_warning"] = bool(fda.get("boxed_warning"))
    result["fda_interactions_text"] = fda.get("drug_interactions", "")[:400]

    return result
