from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import re
import os
from openai import OpenAI

router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class DrugCheckRequest(BaseModel):
    drug1: str
    drug2: str

class DrugCheckResponse(BaseModel):
    severity: str  # "safe", "caution", "contraindicated"
    title: str
    description: str
    recommendations: List[str]

# Drug interaction database (simplified for demo)
DRUG_INTERACTIONS = {
    # High-risk interactions
    ("warfarin", "aspirin"): {
        "severity": "contraindicated",
        "title": "Major Bleeding Risk",
        "description": "Warfarin and Aspirin both increase bleeding risk. Combined use significantly increases the risk of major bleeding events including intracranial and gastrointestinal bleeding.",
        "recommendations": [
            "Avoid concurrent use unless absolutely necessary",
            "If combination required, use lowest effective doses",
            "Monitor INR weekly initially, then every 2 weeks",
            "Educate patient on bleeding signs and symptoms",
            "Consider PPI for GI protection"
        ]
    },

    ("metformin", "contrast"): {
        "severity": "caution",
        "title": "Lactic Acidosis Risk",
        "description": "Metformin should be held before contrast procedures due to risk of contrast-induced nephropathy leading to lactic acidosis.",
        "recommendations": [
            "Hold Metformin 48 hours before contrast procedure",
            "Check eGFR before restarting Metformin",
            "Resume Metformin only if eGFR stable/normal",
            "Ensure adequate hydration during procedure",
            "Monitor for signs of lactic acidosis"
        ]
    },

    ("lisinopril", "spironolactone"): {
        "severity": "caution",
        "title": "Hyperkalemia Risk",
        "description": "ACE inhibitors and potassium-sparing diuretics can cause dangerous hyperkalemia, especially in patients with kidney disease or diabetes.",
        "recommendations": [
            "Monitor potassium levels within 1 week of starting combination",
            "Check potassium every 2-4 weeks initially",
            "Avoid potassium supplements and salt substitutes",
            "Monitor renal function closely",
            "Hold both drugs if potassium >5.5 mEq/L"
        ]
    },

    ("digoxin", "furosemide"): {
        "severity": "caution",
        "title": "Digoxin Toxicity Risk",
        "description": "Furosemide can cause hypokalemia and hypomagnesemia, which increase the risk of digoxin toxicity and cardiac arrhythmias.",
        "recommendations": [
            "Monitor potassium and magnesium levels weekly",
            "Maintain potassium >4.0 mEq/L",
            "Maintain magnesium >1.8 mg/dL",
            "Monitor digoxin levels closely",
            "Watch for signs of digoxin toxicity"
        ]
    },

    ("simvastatin", "amiodarone"): {
        "severity": "contraindicated",
        "title": "Severe Myopathy Risk",
        "description": "Amiodarone significantly increases simvastatin levels, leading to increased risk of severe myopathy and rhabdomyolysis.",
        "recommendations": [
            "Do not exceed simvastatin 20mg daily with amiodarone",
            "Consider switching to atorvastatin or rosuvastatin",
            "Monitor CK levels baseline and periodically",
            "Educate patient on muscle pain/weakness symptoms",
            "Discontinue statin if CK >10x normal"
        ]
    },

    # Safe combinations
    ("metformin", "lisinopril"): {
        "severity": "safe",
        "title": "Safe to Prescribe",
        "description": "Metformin and Lisinopril have no significant drug interactions and are commonly prescribed together for diabetic patients.",
        "recommendations": [
            "Monitor blood pressure and renal function periodically",
            "Ensure patient is aware of signs of hypotension",
            "Check eGFR every 6 months for Metformin safety"
        ]
    },

    ("metformin", "aspirin"): {
        "severity": "safe",
        "title": "Safe to Prescribe",
        "description": "Metformin and low-dose Aspirin can be safely prescribed together. This is a common combination for cardiovascular protection in diabetic patients.",
        "recommendations": [
            "Monitor for gastrointestinal bleeding signs",
            "Use lowest effective aspirin dose (81mg)",
            "Consider PPI if high bleeding risk",
            "Continue glucose monitoring as usual"
        ]
    },
}

def normalize_drug_name(drug: str) -> str:
    """Normalize drug name for lookup"""
    return drug.lower().strip()

def find_interaction(drug1: str, drug2: str) -> Optional[Dict]:
    """Find drug interaction in database"""
    d1 = normalize_drug_name(drug1)
    d2 = normalize_drug_name(drug2)

    # Try both combinations
    interaction = DRUG_INTERACTIONS.get((d1, d2)) or DRUG_INTERACTIONS.get((d2, d1))

    # Handle special cases with partial matching
    if not interaction:
        # Check for common drug name variations
        drug_aliases = {
            "contrast dye": "contrast",
            "iodinated contrast": "contrast",
            "iv contrast": "contrast",
            "hctz": "hydrochlorothiazide",
            "asa": "aspirin",
            "ace inhibitor": "lisinopril",  # Generic example
        }

        # Apply aliases
        d1_alias = drug_aliases.get(d1, d1)
        d2_alias = drug_aliases.get(d2, d2)

        interaction = DRUG_INTERACTIONS.get((d1_alias, d2_alias)) or DRUG_INTERACTIONS.get((d2_alias, d1_alias))

    return interaction

@router.post("/drug-interaction", response_model=DrugCheckResponse)
def check_drug_interaction(request: DrugCheckRequest):
    """Check for interactions between two drugs"""

    if not request.drug1.strip() or not request.drug2.strip():
        raise HTTPException(400, "Both drug names are required")

    # Find interaction
    interaction = find_interaction(request.drug1, request.drug2)

    if interaction:
        return DrugCheckResponse(**interaction)

    # Default response for unknown interactions
    return DrugCheckResponse(
        severity="caution",
        title="Unknown Interaction",
        description=f"No specific interaction data available for {request.drug1} and {request.drug2}. Clinical judgment and additional references may be needed.",
        recommendations=[
            "Consult drug interaction database (Lexicomp, Micromedex)",
            "Review individual drug monographs for contraindications",
            "Consider consulting clinical pharmacist",
            "Monitor patient closely for any adverse effects",
            "Start with lowest effective doses if combining"
        ]
    )


# Drug Information Models and Endpoints

class DrugInfoRequest(BaseModel):
    question: str

class DrugInfoResponse(BaseModel):
    answer: str
    sources: List[str]

DRUG_INFO_PROMPT = """You are a clinical pharmacology expert. Answer questions about medications with accurate, evidence-based information.

CRITICAL: Structure your response in this format:

## Drug Information

[Comprehensive answer with clinical details]

## Key Clinical Points
- Important clinical considerations
- Monitoring requirements
- Contraindications or warnings
- Dosing considerations

## Clinical References
- Mechanism of action details
- Pharmacokinetics
- Drug class information

Guidelines:
- Provide accurate, evidence-based information
- Include mechanism of action when relevant
- Mention important contraindications and monitoring
- Be specific about dosing when appropriate
- Include relevant clinical pearls
- Keep information current with medical standards"""

@router.post("/drug-information", response_model=DrugInfoResponse)
def get_drug_information(request: DrugInfoRequest):
    """Get detailed information about a medication"""

    if not request.question.strip():
        raise HTTPException(400, "Question is required")

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": DRUG_INFO_PROMPT},
                {"role": "user", "content": request.question}
            ],
            temperature=0.2,
            max_tokens=1200,
        )

        answer = response.choices[0].message.content

        return DrugInfoResponse(
            answer=answer,
            sources=[
                "Clinical pharmacology database",
                "Evidence-based medicine references",
                "Current medical literature"
            ]
        )

    except Exception as e:
        # Fallback response
        return DrugInfoResponse(
            answer=f"I'm unable to provide information about this medication at the moment. Please consult:\n\n• Clinical pharmacist\n• Drug reference databases (Lexicomp, Micromedex)\n• Package insert or prescribing information\n• Current medical literature\n\nFor clinical questions, always verify information with authoritative sources.",
            sources=["Error occurred - consult clinical references"]
        )