import json
import os

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EXTRACTION_SYSTEM_PROMPT = """You are a clinical data extraction AI.
Extract the following structured information from the patient medical record text provided.
Return ONLY a valid JSON object with this exact schema:
{
  "patient_name": "string or null",
  "age": "integer or null",
  "gender": "string or null",
  "medical_specialty": "string or null",
  "medications": ["list of medication strings"],
  "allergies": ["list of allergy strings"],
  "diagnoses": ["list of diagnosis strings"],
  "lab_results": [{"test": "...", "value": "...", "unit": "...", "date": "..."}],
  "summary_text": "A 2-3 sentence clinical summary of the patient"
}
If a field cannot be found, use null or an empty array. Never add extra keys."""


def extract_structured_info(raw_text: str) -> dict:
    truncated = raw_text[:12000]

    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
            {"role": "user", "content": f"Medical record:\n\n{truncated}"},
        ],
        temperature=0,
        max_tokens=1500,
    )

    return json.loads(response.choices[0].message.content)
