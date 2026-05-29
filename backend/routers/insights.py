import json
import os
from typing import Optional

from fastapi import APIRouter, HTTPException
from openai import OpenAI

from db.supabase import get_supabase

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

INSIGHTS_SYSTEM_PROMPT = """You are ClinIQ, a senior clinical AI assistant with expertise in pharmacology.
Analyze the patient's complete medical data and return ONLY a valid JSON object with this exact schema:
{
  "clinical_concerns": ["specific concern 1", "specific concern 2", "specific concern 3"],
  "recommended_actions": ["specific action 1", "specific action 2", "specific action 3"],
  "drug_safety_watch": "List ALL known drug interactions between the patient's medications, even minor ones. For each: name both drugs, describe the interaction, and give severity (Major/Moderate/Minor). If truly no interactions exist, write 'No concerning combinations identified.' Be thorough — check every pair of medications.",
  "follow_up_priority": "Urgent|High|Normal|Low",
  "follow_up_rationale": "1-2 sentence explanation of the priority level based on the patient's current status."
}
Rules:
- clinical_concerns must reference specific values from the data (e.g. 'TSH 6.2 — above normal range of 0.4-4.0')
- recommended_actions must be specific clinical steps, not generic advice
- drug_safety_watch: ALWAYS check these known interactions: Lithium+NSAIDs, Lithium+SSRIs, Warfarin+Aspirin, ACE inhibitors+Potassium, Metformin+contrast, Benzodiazepines+opioids, Sertraline+Tramadol, SSRIs+MAOIs, any QT-prolonging drugs together
- Be specific and clinically precise. Base everything strictly on the provided data."""


@router.post("/insights/{patient_id}")
def get_insights(patient_id: str):
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
    if not extracted.data:
        raise HTTPException(404, "No extracted data for this patient")

    p = patient.data[0]
    info = extracted.data[0]

    context = f"""
Patient: {p.get('name')}, Age: {p.get('age')}, Gender: {p.get('gender')}
Specialty: {p.get('medical_specialty')}
Diagnoses: {', '.join(info.get('diagnoses') or [])}
Medications: {', '.join(info.get('medications') or [])}
Allergies: {', '.join(info.get('allergies') or [])}
Lab Results: {json.dumps(info.get('lab_results') or [])}
Clinical Summary: {info.get('summary_text') or ''}
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": INSIGHTS_SYSTEM_PROMPT},
            {"role": "user", "content": context},
        ],
        temperature=0.3,
        max_tokens=700,
    )

    return json.loads(response.choices[0].message.content)
