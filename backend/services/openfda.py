"""
Real drug data from OpenFDA and RxNorm — no API key required.
OpenFDA: https://api.fda.gov  (FDA official drug labels)
RxNorm:  https://rxnav.nlm.nih.gov (NIH drug name normalization)
"""
import httpx

OPENFDA_URL = "https://api.fda.gov/drug/label.json"
RXNORM_URL  = "https://rxnav.nlm.nih.gov/REST"

TIMEOUT = 8.0


def normalize_drug_name(drug_name: str) -> str:
    """Use RxNorm to normalize a drug name (Tylenol → Acetaminophen)."""
    try:
        resp = httpx.get(
            f"{RXNORM_URL}/rxcui.json",
            params={"name": drug_name, "allsrc": "0"},
            timeout=TIMEOUT,
        )
        data = resp.json()
        rxcui = data.get("idGroup", {}).get("rxnormId", [])
        if not rxcui:
            return drug_name  # couldn't normalize, use original

        # Get the official name for this RxCUI
        name_resp = httpx.get(
            f"{RXNORM_URL}/rxcui/{rxcui[0]}/property.json",
            params={"propName": "RxNorm Name"},
            timeout=TIMEOUT,
        )
        name_data = name_resp.json()
        props = name_data.get("propConceptGroup", {}).get("propConcept", [])
        if props:
            return props[0].get("propValue", drug_name)
        return drug_name
    except Exception:
        return drug_name


def get_drug_label(drug_name: str) -> dict:
    """
    Pull real FDA drug label data from OpenFDA.
    Returns structured dict with warnings, interactions, contraindications.
    Returns empty dict if drug not found.
    """
    try:
        # Try brand name first, then generic
        query = f'openfda.brand_name:"{drug_name}" openfda.generic_name:"{drug_name}"'
        resp = httpx.get(
            OPENFDA_URL,
            params={"search": query, "limit": "1"},
            timeout=TIMEOUT,
        )

        if resp.status_code != 200:
            # Try simpler search
            resp = httpx.get(
                OPENFDA_URL,
                params={"search": drug_name, "limit": "1"},
                timeout=TIMEOUT,
            )

        if resp.status_code != 200:
            return {}

        data = resp.json()
        results = data.get("results", [])
        if not results:
            return {}

        label = results[0]

        def first(field: str) -> str:
            val = label.get(field, [])
            return val[0].strip() if val else ""

        return {
            "found": True,
            "brand_names": label.get("openfda", {}).get("brand_name", []),
            "generic_names": label.get("openfda", {}).get("generic_name", []),
            "manufacturer": label.get("openfda", {}).get("manufacturer_name", []),
            "boxed_warning":         first("boxed_warning"),
            "contraindications":     first("contraindications"),
            "warnings_and_cautions": first("warnings_and_cautions"),
            "drug_interactions":     first("drug_interactions"),
            "adverse_reactions":     first("adverse_reactions"),
            "indications":           first("indications_and_usage"),
        }

    except Exception:
        return {}


def get_drug_summary(drug_name: str) -> dict:
    """
    Get normalized name + FDA label in one call.
    This is the main entry point used by the drug checker.
    """
    normalized = normalize_drug_name(drug_name)
    label = get_drug_label(normalized)

    # If not found with normalized name, try original
    if not label.get("found") and normalized != drug_name:
        label = get_drug_label(drug_name)

    return {
        "original_name": drug_name,
        "normalized_name": normalized,
        "fda_label": label,
    }
