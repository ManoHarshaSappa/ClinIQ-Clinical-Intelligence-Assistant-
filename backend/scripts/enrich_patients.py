"""
Enrich sparse patient records with realistic clinical data using GPT-4o.
Targets patients with < 2 medications OR no lab results.

Run:
  cd backend
  source .venv/bin/activate
  python scripts/enrich_patients.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv; load_dotenv()

from openai import OpenAI
from db.supabase import get_supabase

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ENRICH_PROMPT = """You are a senior clinical documentation specialist with 20 years of experience.

Given a patient's diagnosis, specialty, demographics, and any available clinical notes,
generate a COMPLETE and REALISTIC clinical profile.

Rules:
- If the raw text mentions specific medications/allergies/labs — USE them exactly
- For gaps, generate clinically accurate data that a real patient with these conditions would have
- All lab values must be realistic numbers (not just "elevated" — give actual values)
- Medications must include dose and frequency (e.g., "Metoprolol 25mg once daily")
- At least 3-5 medications, 1-2 allergies, 3-5 lab results
- Summary must be 3 sentences, clinically precise

Return ONLY valid JSON with this exact schema:
{
  "patient_name": "string or null",
  "age": integer or null,
  "gender": "string or null",
  "medical_specialty": "string or null",
  "medications": ["medication 1 with dose", "medication 2 with dose", ...],
  "allergies": ["allergy 1 with reaction", ...],
  "diagnoses": ["diagnosis 1", "diagnosis 2", ...],
  "lab_results": [
    {"test": "test name", "value": "numeric value", "unit": "unit", "date": "YYYY-MM-DD"}
  ],
  "summary_text": "3-sentence clinical summary"
}"""


def enrich_patient(patient: dict, extracted: dict, raw_text: str) -> dict:
    context = f"""
Patient: {patient.get('name')}, Age: {patient.get('age')}, Gender: {patient.get('gender')}
Medical Specialty: {patient.get('medical_specialty')}

Existing extracted data:
- Diagnoses: {', '.join(extracted.get('diagnoses') or [])}
- Medications: {', '.join(extracted.get('medications') or []) or 'NONE — needs to be generated'}
- Allergies: {', '.join(extracted.get('allergies') or []) or 'NONE — generate 1-2 realistic ones'}
- Lab Results: {json.dumps(extracted.get('lab_results') or []) or 'NONE — generate 3-5 realistic labs'}
- Summary: {extracted.get('summary_text') or 'NONE'}

Raw clinical text:
{raw_text[:3000]}
"""
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ENRICH_PROMPT},
            {"role": "user", "content": context},
        ],
        temperature=0.3,
        max_tokens=1200,
    )
    return json.loads(response.choices[0].message.content)


def run():
    sb = get_supabase()

    # Get all extracted info
    all_extracted = sb.table("extracted_info").select("*").execute().data
    all_patients  = {p["id"]: p for p in sb.table("patients").select("*").execute().data}
    all_docs      = {}
    for doc in sb.table("documents").select("patient_id, raw_text").execute().data:
        all_docs[doc["patient_id"]] = doc.get("raw_text", "")

    # Find sparse ones
    sparse = [
        e for e in all_extracted
        if len(e.get("medications") or []) < 2 or len(e.get("lab_results") or []) < 1
    ]

    print(f"Enriching {len(sparse)} sparse patients...\n")

    for i, ext in enumerate(sparse):
        pid = ext["patient_id"]
        patient = all_patients.get(pid, {})
        raw_text = all_docs.get(pid, "")
        name = patient.get("name", "Unknown")

        print(f"[{i+1}/{len(sparse)}] {name} ({patient.get('medical_specialty','?')})...", end=" ", flush=True)

        try:
            enriched = enrich_patient(patient, ext, raw_text)

            # Update extracted_info
            sb.table("extracted_info").update({
                "medications":   enriched.get("medications", []),
                "allergies":     enriched.get("allergies", []),
                "diagnoses":     enriched.get("diagnoses", ext.get("diagnoses", [])),
                "lab_results":   enriched.get("lab_results", []),
                "summary_text":  enriched.get("summary_text", ""),
            }).eq("patient_id", pid).execute()

            # Update patient age/gender if was missing
            updates = {}
            if not patient.get("age") and enriched.get("age"):
                updates["age"] = enriched["age"]
            if not patient.get("gender") and enriched.get("gender"):
                updates["gender"] = enriched["gender"]
            if updates:
                sb.table("patients").update(updates).eq("id", pid).execute()

            meds_count = len(enriched.get("medications", []))
            labs_count = len(enriched.get("lab_results", []))
            print(f"✓  {meds_count} meds, {labs_count} labs")

        except Exception as e:
            print(f"✗  Error: {e}")

    print(f"\nDone. {len(sparse)} patients enriched.")


if __name__ == "__main__":
    run()
