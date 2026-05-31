function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }

  // Force local development when NODE_ENV is development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000/api";
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}/api`;
  }

  return "http://localhost:3000/api";
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  medical_specialty: string | null;
  created_at: string;
  allergy_count?: number;
}

export interface LabResult {
  test: string;
  value: string;
  unit: string;
  date: string;
}

export interface ExtractedInfo {
  id: string;
  patient_id: string;
  medications: string[];
  allergies: string[];
  diagnoses: string[];
  lab_results: LabResult[];
  summary_text: string;
}

export interface PatientDocument {
  id: string;
  file_name: string;
  uploaded_at: string;
}

export interface PatientDetail {
  patient: Patient;
  extracted_info: ExtractedInfo | null;
  documents: PatientDocument[];
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface SearchResult {
  id: string;
  patient_id: string;
  chunk_text: string;
  similarity: number;
  patient_name: string;
  patient_specialty: string | null;
}

export interface StatsResponse {
  total_patients: number;
  total_documents: number;
  total_embeddings: number;
  specialty_breakdown: Record<string, number>;
}

export interface InsightsResponse {
  clinical_concerns: string[];
  recommended_actions: string[];
  drug_safety_watch: string;
  follow_up_priority: "Urgent" | "High" | "Normal" | "Low";
  follow_up_rationale: string;
}

export interface DrugCheckResponse {
  status: "safe" | "warning" | "danger";
  summary: string;
  interactions: string[];
  allergy_flags: string[];
  recommendation: string;
  fda_found: boolean;
  normalized_name: string;
  brand_names: string[];
  has_boxed_warning: boolean;
  fda_interactions_text: string;
}

export interface BEFASTData {
  balance: string;
  eyes: string;
  face: string;
  arm: string;
  speech: string;
  symptom_onset: string;
  patient_name: string;
  patient_age?: number;
  patient_id?: string;
}

export interface EmergencyAssessmentResult {
  risk_level: "High" | "Medium" | "Low";
  risk_score: number;
  positive_indicators: string[];
  immediate_actions: string[];
  clinical_notes: string;
  time_critical: boolean;
}

export interface EmergencyPacket {
  packet_text: string;
  patient_name: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── API Functions ─────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<{ patient_id: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${getApiBaseUrl()}/upload`, { method: "POST", body: form });
  return handleResponse(res);
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${getApiBaseUrl()}/stats`, { cache: "no-store" });
  return handleResponse(res);
}

export async function getPatients(): Promise<Patient[]> {
  const res = await fetch(`${getApiBaseUrl()}/patients`, { cache: "no-store" });
  return handleResponse(res);
}

export async function getPatient(id: string): Promise<PatientDetail> {
  const res = await fetch(`${getApiBaseUrl()}/patients/${id}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function sendChat(question: string, patientId?: string): Promise<ChatResponse> {
  const res = await fetch(`${getApiBaseUrl()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, patient_id: patientId }),
  });
  return handleResponse(res);
}

export async function searchPatients(q: string): Promise<{ results: SearchResult[] }> {
  const res = await fetch(`${getApiBaseUrl()}/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function getInsights(patientId: string): Promise<InsightsResponse> {
  const res = await fetch(`${getApiBaseUrl()}/insights/${patientId}`, { method: "POST" });
  return handleResponse(res);
}

export async function checkDrug(patientId: string, drugName: string): Promise<DrugCheckResponse> {
  const res = await fetch(`${getApiBaseUrl()}/drug-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patient_id: patientId, drug_name: drugName }),
  });
  return handleResponse(res);
}

export async function assessBefast(data: BEFASTData): Promise<EmergencyAssessmentResult> {
  const res = await fetch(`${getApiBaseUrl()}/emergency/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getEmergencyPacket(patientId: string): Promise<EmergencyPacket> {
  const res = await fetch(`${getApiBaseUrl()}/emergency/packet/${patientId}`, { method: "POST" });
  return handleResponse(res);
}

export async function getDocumentText(documentId: string): Promise<{ file_name: string; raw_text: string; uploaded_at: string }> {
  const res = await fetch(`${getApiBaseUrl()}/documents/${documentId}/text`, { cache: "no-store" });
  return handleResponse(res);
}
