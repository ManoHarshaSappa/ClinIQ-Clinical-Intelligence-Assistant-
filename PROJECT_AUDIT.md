# ClinIQ Project Audit

Last updated: 2026-05-28

## Purpose

This file is the current handoff/status snapshot for the ClinIQ project.
It is based on the code that exists in this workspace, not just on README claims.

## Overall Status

The project has a working full-stack skeleton with:

- a FastAPI backend
- a Next.js frontend
- OpenAI-powered extraction
- embedding storage and semantic search hooks
- patient list/detail pages
- per-patient chat UI

The app looks structurally close to a demoable MVP, but it is not fully production-ready yet.
The biggest remaining gaps are live end-to-end validation, a search page in the frontend, testing, deployment hardening, and security cleanup.

## What Is Built and Present in Code

### Backend

- `backend/main.py`
  - FastAPI app is set up
  - CORS middleware is configured
  - routers are registered
  - `/health` endpoint exists

- `backend/db/supabase.py`
  - Supabase singleton client exists
  - backend expects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

- `backend/services/parser.py`
  - supports `.pdf`, `.csv`, `.txt`, `.md`
  - PDF extraction uses PyMuPDF first, then pdfplumber fallback

- `backend/services/extraction.py`
  - sends raw medical record text to OpenAI
  - extracts structured JSON fields:
    - patient name
    - age
    - gender
    - specialty
    - medications
    - allergies
    - diagnoses
    - lab results
    - summary text

- `backend/services/embeddings.py`
  - chunks raw text
  - creates embeddings
  - stores embeddings in Supabase
  - supports similarity search through `match_embeddings` RPC

- `backend/services/rag.py`
  - retrieves top matching chunks
  - builds grounded context
  - asks OpenAI to answer only from retrieved record text

- `backend/routers/upload.py`
  - full upload pipeline exists:
    - validate extension
    - parse file
    - extract structured info
    - insert patient row
    - insert document row
    - insert extracted info row
    - store embeddings

- `backend/routers/patients.py`
  - `GET /patients`
  - `GET /patients/{patient_id}`

- `backend/routers/extract.py`
  - `POST /extract/{patient_id}` re-runs extraction on latest document

- `backend/routers/chat.py`
  - `POST /chat`
  - `GET /search`

- `backend/scripts/load_mtsamples.py`
  - bulk loader exists for demo/sample records

### Frontend

- `frontend/app/page.tsx`
  - landing page exists
  - upload CTA exists
  - basic feature marketing blocks exist

- `frontend/components/FileUpload.tsx`
  - drag and drop upload exists
  - browse file upload exists
  - redirects to patient detail page after success
  - inline upload/loading/error states exist

- `frontend/app/patients/page.tsx`
  - all-patients page exists
  - empty state exists
  - backend connection failure message exists

- `frontend/components/PatientCard.tsx`
  - patient summary card exists

- `frontend/app/patients/[id]/page.tsx`
  - patient detail page exists
  - summary + chat two-column layout exists

- `frontend/components/SummaryCard.tsx`
  - shows summary text
  - diagnoses
  - medications
  - allergies
  - lab results

- `frontend/components/ChatWindow.tsx`
  - per-patient chat exists
  - source snippets are displayed in collapsible details
  - loading and error states exist

- `frontend/lib/api.ts`
  - typed wrappers exist for:
    - upload
    - list patients
    - patient detail
    - chat
    - search

### Project Setup

- `.gitignore` exists
- `.env.example` exists
- `frontend/package.json` exists
- `backend/requirements.txt` exists

## What I Verified

### Verified Successfully

- frontend production build passes with `npm run build`
- dynamic patient route exists and compiles
- backend code structure is coherent and routes/services connect logically

### Not Fully Verified Yet

- actual upload against live backend
- actual extraction with current OpenAI key
- actual Supabase writes
- actual embedding RPC behavior
- actual end-to-end patient chat answers
- actual sample data load

These need live env + database + API execution, so they are not proven just from code inspection.

## What Is Still Missing

### User-Facing Feature Gaps

- no frontend search page yet
  - backend `GET /search` exists
  - `frontend/app/search/page.tsx` does not exist

- no re-extract button in UI
  - backend route exists
  - frontend trigger does not exist

- no toast system
  - errors/success are inline only

- no auth / access control
  - app is open if deployed as-is

### Engineering Gaps

- no automated tests found
  - `backend/tests` exists but contains no test files
  - no frontend test setup found

- no DB schema/migration files found in repo
  - current database structure seems to live outside the repo
  - this makes onboarding and reproducibility weaker

- no deployment config files found
  - no Dockerfile
  - no Render config
  - no Vercel project config

- frontend README is still the default Next.js template
  - project-specific frontend setup docs are missing

## Risks and Cleanup Needed

### Urgent

- `backend/.env` currently contains real secrets in the workspace
  - OpenAI key is present
  - Supabase service role key is present
  - these should be rotated and removed from tracked/shared repo history before publishing

### Medium Risk

- embedding model is `text-embedding-ada-002`
  - this is an older model choice
  - it may still work depending on environment, but should be reviewed before long-term use

- no explicit retry/error handling around OpenAI or Supabase calls
  - failures will likely surface directly to users

- no file size limits or rate limiting in upload route
  - this is okay for a local/demo app
  - not okay for open public deployment

- patient creation on every upload can create duplicates
  - there is no deduping or merge strategy yet

## Notes on README Accuracy

The root `README.md` is directionally correct, but a few items are still assumptions until runtime validation:

- "What Is Built" is mostly accurate from the code
- "Search UI page" is correctly marked pending
- deployment steps are documented, but deployment is not set up in repo
- sample data load command depends on a CSV file that is ignored and not currently present in this workspace

## Best Next Steps

### Priority 1

- remove secret leakage risk
  - rotate OpenAI and Supabase secrets
  - keep only `.env.example` in repo

### Priority 2

- run a true end-to-end demo test
  - start backend
  - start frontend
  - upload a real file
  - confirm patient row, extracted info, embeddings, and chat all work

### Priority 3

- build search UI
  - add `frontend/app/search/page.tsx`
  - connect it to `searchPatients()`
  - show patient links and chunk previews

### Priority 4

- add patient-page controls
  - re-extract button
  - better loading/error states
  - optional toasts

### Priority 5

- add minimal test coverage
  - backend route smoke tests
  - frontend API/client rendering smoke tests

## Suggested Immediate Build Plan

If we continue from here, the best order is:

1. Secure env handling
2. Verify full local demo flow
3. Add search page
4. Add re-extract button
5. Add tests and deployment polish

## Quick Reality Check

This is not an empty starter anymore.
You already have the main clinical workflow scaffolded:

- upload
- parse
- extract
- store
- list
- inspect
- ask questions

What remains is mostly validation, polish, search UI, security cleanup, and production-readiness work.
