import os
from typing import Optional

from openai import OpenAI

from db.supabase import get_supabase

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBEDDING_MODEL = "text-embedding-ada-002"


def chunk_text(text: str) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c for c in chunks if len(c.strip()) > 20]


def embed_texts(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in response.data]


def store_embeddings(patient_id: str, document_id: str, raw_text: str) -> None:  # noqa: E501
    supabase = get_supabase()
    chunks = chunk_text(raw_text)
    if not chunks:
        return

    vectors = embed_texts(chunks)

    rows = [
        {
            "patient_id": patient_id,
            "document_id": document_id,
            "chunk_text": chunk,
            "embedding": vector,
        }
        for chunk, vector in zip(chunks, vectors)
    ]

    supabase.table("embeddings").insert(rows).execute()


def similarity_search(
    query: str, patient_id: Optional[str] = None, top_k: int = 5
) -> list:
    supabase = get_supabase()
    query_vector = embed_texts([query])[0]

    params: dict = {"query_embedding": query_vector, "match_count": top_k}
    if patient_id:
        params["filter_patient_id"] = patient_id

    result = supabase.rpc("match_embeddings", params).execute()
    return result.data
