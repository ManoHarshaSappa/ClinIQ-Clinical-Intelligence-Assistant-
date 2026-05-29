import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, drug_check, drug_interaction, emergency, extract, insights, patients, upload

app = FastAPI(title="ClinIQ API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(patients.router, tags=["Patients"])
app.include_router(extract.router, tags=["Extract"])
app.include_router(chat.router, tags=["Chat"])
app.include_router(insights.router, tags=["Insights"])
app.include_router(drug_check.router, tags=["Drug Check"])
app.include_router(drug_interaction.router, tags=["Drug Interaction"])
app.include_router(emergency.router, tags=["Emergency"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
