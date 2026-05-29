# ClinIQ — Clinical Intelligence Assistant

AI-powered assistant that lets doctors upload patient records, auto-extract structured data, and chat with the records using RAG.

---

## What Is Built ✅

### Infrastructure
- [x] Supabase project connected (`pxtldxfprbrcuhnhzzcw`)
- [x] PostgreSQL schema: `patients`, `documents`, `extracted_info`, `embeddings` tables
- [x] pgvector extension enabled + IVFFlat index
- [x] `match_embeddings` RPC function (cosine similarity search)
- [x] `backend/.env` configured (OpenAI key + Supabase keys)
- [x] `frontend/.env.local` configured

### Backend (FastAPI + Python)

| File | What It Does | Status |
|------|-------------|--------|
| `backend/main.py` | FastAPI app entry point, CORS middleware | ✅ |
| `backend/db/supabase.py` | Singleton Supabase client | ✅ |
| `backend/services/parser.py` | PDF (PyMuPDF → pdfplumber), CSV, TXT parsing | ✅ |
| `backend/services/extraction.py` | GPT-4o JSON-mode structured extraction | ✅ |
| `backend/services/embeddings.py` | Chunking + ada-002 embeddings + pgvector storage | ✅ |
| `backend/services/rag.py` | Similarity search → GPT-4o grounded answers | ✅ |
| `backend/routers/upload.py` | `POST /upload` — full pipeline | ✅ |
| `backend/routers/patients.py` | `GET /patients`, `GET /patients/{id}` | ✅ |
| `backend/routers/extract.py` | `POST /extract/{id}` — re-run extraction | ✅ |
| `backend/routers/chat.py` | `POST /chat`, `GET /search` | ✅ |
| `backend/scripts/load_mtsamples.py` | Bulk seed from mtsamples.csv | ✅ |
| `backend/requirements.txt` | All pinned dependencies | ✅ |

### Frontend (Next.js 14 + Tailwind + shadcn/ui)

| File | What It Does | Status |
|------|-------------|--------|
| `frontend/lib/api.ts` | Typed fetch wrappers for all API endpoints | ✅ |
| `frontend/lib/utils.ts` | Tailwind class merge utility | ✅ |
| `frontend/components/ui/` | Button, Card, Badge, Input (shadcn primitives) | ✅ |
| `frontend/components/FileUpload.tsx` | Drag-and-drop file upload with progress state | ✅ |
| `frontend/components/PatientCard.tsx` | Patient list card with badges | ✅ |
| `frontend/components/SummaryCard.tsx` | Summary card: diagnoses, meds, allergies, labs | ✅ |
| `frontend/components/ChatWindow.tsx` | RAG chat UI with source viewer | ✅ |
| `frontend/app/page.tsx` | Landing page + upload dropzone | ✅ |
| `frontend/app/patients/page.tsx` | All patients list | ✅ |
| `frontend/app/patients/[id]/page.tsx` | Patient detail + chat (2-col layout) | ✅ |

---

## What Is Pending ⏳

### Must Do Before Demo

| Task | Details |
|------|---------|
| **Load test data** | Run `python scripts/load_mtsamples.py ../data/mtsamples.csv --limit 10` from `backend/` |
| **End-to-end test** | Upload a real file → verify summary card → test chat with a question |
| **Search UI page** | `GET /search` backend is ready but no frontend page exists yet |

### Nice to Have

| Task | Details |
|------|---------|
| **Search page frontend** | `frontend/app/search/page.tsx` — input field + results list showing patient matches |
| **Loading skeleton** | Skeleton screens while patient data loads (currently shows blank) |
| **Re-extract button** | UI button on patient page to trigger `POST /extract/{id}` |
| **Toast notifications** | Success/error toasts after upload or chat errors |
| **Authentication** | No login system — currently open access (fine for demo) |

### Deployment

| Task | Details |
|------|---------|
| **Deploy frontend → Vercel** | `cd frontend && vercel --prod`, set `NEXT_PUBLIC_API_URL` to Render URL |
| **Deploy backend → Render** | New Web Service, start cmd: `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Update CORS** | Add Vercel URL to `ALLOWED_ORIGINS` in backend env on Render |

---

## How to Run Locally

### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm run dev
# App: http://localhost:3000
```

### Seed Test Data
```bash
cd backend
source .venv/bin/activate
python scripts/load_mtsamples.py ../data/mtsamples.csv --limit 10
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload file → parse → extract → embed |
| `GET` | `/patients` | List all patients |
| `GET` | `/patients/{id}` | Patient detail + extracted info |
| `POST` | `/extract/{id}` | Re-run GPT-4o extraction |
| `POST` | `/chat` | RAG question answering |
| `GET` | `/search?q=` | Semantic search across all records |
| `GET` | `/health` | Health check |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.9) |
| Database | Supabase (PostgreSQL 17 + pgvector) |
| AI Extraction | OpenAI GPT-4o (JSON mode) |
| Embeddings | OpenAI text-embedding-ada-002 |
| Vector Search | pgvector (cosine similarity via IVFFlat index) |
| PDF Parsing | PyMuPDF + pdfplumber |
| Deployment | Vercel (frontend) + Render (backend) |
