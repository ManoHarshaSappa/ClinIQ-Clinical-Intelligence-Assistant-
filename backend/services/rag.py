import json
import os
import re
from typing import Optional

from openai import OpenAI

from services.embeddings import similarity_search

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

RAG_SYSTEM_PROMPT = """You are ClinIQ, a clinical decision support assistant. You help doctors make informed decisions by clearly separating facts from recommendations.

CRITICAL: You must structure EVERY response in this exact format:

## 📋 Evidence from Patient Record
[Facts ONLY from the patient data — medications, allergies, lab values, diagnoses with dates/sources]

## ⚠️ Missing Clinical Information
[Essential data needed but not available — eGFR, BMI, recent vitals, etc. Be specific about why each is clinically relevant]

## 🔬 Clinical Assessment
[Your interpretation of the available evidence, including confidence level: High/Medium/Low and reasoning]

## 💡 Clinical Recommendation
[Specific actions, with risk quantification when relevant. For drug allergies, specify actual cross-reactivity percentages]

## 📊 Confidence & Limitations
**Confidence Level:** [High/Medium/Low] based on [specific reasons]
**Key Limitations:** [What missing data affects decision quality]
**Evidence Strength:** [Strong/Moderate/Weak] - [reasoning]

CLINICAL ACCURACY RULES:
- Sulfonamide allergies: Cross-reactivity with sulfonylureas is ~3-5%, not contraindicated but monitor
- Always quantify risks with percentages when known
- Flag when kidney function (eGFR) unknown but relevant for drug dosing
- Distinguish between documented allergies vs. intolerances vs. adverse effects
- Never present AI reasoning as medical facts
- Be specific about clinical context: "Based on diabetes diagnosis but missing HbA1c..."
"""

GREETINGS = {
    "hi", "hello", "hey", "hii", "hiii", "hiiii", "hiiiii",
    "yo", "sup", "how are you", "what's up", "good morning",
    "good afternoon", "good evening", "howdy", "greetings", "hi there",
}


def is_greeting(text: str) -> bool:
    cleaned = re.sub(r"[^a-z\s]", "", text.lower().strip())
    return cleaned in GREETINGS


def build_structured_context(patient_id: str) -> str:
    """Fetch structured patient profile with clinical decision context."""
    try:
        from db.supabase import get_supabase
        sb = get_supabase()

        patient = sb.table("patients").select("*").eq("id", patient_id).execute()
        extracted = (
            sb.table("extracted_info")
            .select("*")
            .eq("patient_id", patient_id)
            .execute()
        )

        if not patient.data:
            return ""

        p = patient.data[0]
        info = extracted.data[0] if extracted.data else {}

        medications = info.get("medications") or []
        allergies   = info.get("allergies") or []
        diagnoses   = info.get("diagnoses") or []
        labs        = info.get("lab_results") or []
        summary     = info.get("summary_text") or ""

        # Build clinical context with decision-relevant gaps
        meds_text = "\n".join(f"  - {m}" for m in medications) if medications else "  None documented"
        allergy_text = "\n".join(f"  - {a}" for a in allergies) if allergies else "  No known allergies documented"
        diag_text = "\n".join(f"  - {d}" for d in diagnoses) if diagnoses else "  None documented"

        # Enhanced lab results with clinical relevance
        labs_text = "\n".join(
            f"  - {lr.get('test','?')}: {lr.get('value','?')} {lr.get('unit','')} ({lr.get('date','')})"
            for lr in labs
        ) if labs else "  No lab results on file"

        # Identify common clinical gaps for decision support
        missing_items = []
        if not any("creatinine" in str(lab).lower() or "egfr" in str(lab).lower() for lab in labs):
            missing_items.append("Kidney function (eGFR/creatinine)")
        if not any("hba1c" in str(lab).lower() or "glucose" in str(lab).lower() for lab in labs):
            if any("diabetes" in str(diag).lower() for diag in diagnoses):
                missing_items.append("Diabetes control (HbA1c)")
        if not any("weight" in str(summary).lower() or "bmi" in str(summary).lower()):
            missing_items.append("Current BMI/weight")

        missing_text = "\n".join(f"  - {item}" for item in missing_items) if missing_items else "  Most essential data appears available"

        return f"""
=== CLINICAL DECISION CONTEXT ===
Patient: {p.get('name')}, {p.get('age')} years old, {p.get('gender')}
Medical Specialty: {p.get('medical_specialty')}

CLINICAL SUMMARY:
{summary or "No summary available"}

DOCUMENTED DIAGNOSES:
{diag_text}

CURRENT MEDICATIONS:
{meds_text}

DOCUMENTED ALLERGIES:
{allergy_text}

AVAILABLE LAB RESULTS:
{labs_text}

COMMONLY MISSING CLINICAL DATA:
{missing_text}
=== END CLINICAL CONTEXT ===
"""
    except Exception as e:
        return f"Error accessing patient data: {str(e)}"


def rag_answer(question: str, patient_id: Optional[str]) -> dict:
    # Handle greetings without searching records
    if is_greeting(question):
        return {
            "answer": (
                "Hello! I'm ClinIQ, your clinical intelligence assistant.\n\n"
                "I have this patient's full records loaded. Ask me anything:\n\n"
                "• What medications are they on?\n"
                "• Any allergies I should know?\n"
                "• What do their lab results show?\n"
                "• What's their full diagnosis history?\n"
                "• Is it safe to prescribe [drug name]?\n\n"
                "What would you like to know?"
            ),
            "sources": [],
        }

    context_parts = []

    # 1. Always include structured data first (most reliable)
    if patient_id:
        structured = build_structured_context(patient_id)
        if structured:
            context_parts.append(structured)

    # 2. Similarity search for relevant raw text chunks with source tracking
    chunks = similarity_search(question, patient_id=patient_id, top_k=5)
    source_chunks = []
    if chunks:
        raw_context = "\n\n=== CLINICAL RECORD EXCERPTS (for evidence attribution) ===\n"
        for i, c in enumerate(chunks):
            excerpt_id = f"Source-{i+1}"
            raw_context += f"\n[{excerpt_id}]: {c['chunk_text']}\n---"
            source_chunks.append({
                "id": excerpt_id,
                "text": c['chunk_text'][:300],
                "similarity": round(c.get('similarity', 0) * 100, 1)
            })
        context_parts.append(raw_context)

    if not context_parts:
        return {
            "answer": "No records found for this patient. Please upload their medical documents first.",
            "sources": [],
        }

    full_context = "\n\n".join(context_parts)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"{full_context}\n\nDoctor's question: {question}",
            },
        ],
        temperature=0.2,
        max_tokens=900,
    )

    # Include enhanced source tracking and clinical context
    answer_text = response.choices[0].message.content

    # Convert sources to simple strings for frontend compatibility
    simple_sources = [chunk["text"] for chunk in source_chunks] if source_chunks else [c["chunk_text"][:200] for c in chunks]

    return {
        "answer": answer_text,
        "sources": simple_sources,
        "patient_context": {
            "structured_data_available": bool(structured if patient_id else False),
            "raw_excerpts_found": len(chunks),
            "confidence_indicators": {
                "has_recent_labs": any("lab" in str(chunk).lower() for chunk in chunks[:3]),
                "has_medication_list": any("medication" in str(chunk).lower() for chunk in chunks[:3]),
                "has_allergy_info": any("allerg" in str(chunk).lower() for chunk in chunks[:3])
            }
        }
    }
