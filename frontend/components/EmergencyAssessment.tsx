"use client";
import { useState } from "react";
import { assessBefast, getEmergencyPacket, getPatients, EmergencyAssessmentResult, Patient } from "@/lib/api";
import { AlertTriangle, CheckCircle2, AlertCircle, Phone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Answer = "yes" | "no" | "unsure" | "";
interface BEFASTForm {
  balance: Answer; eyes: Answer; face: Answer;
  arm: Answer; speech: Answer;
  symptom_onset: string; patient_name: string; patient_age: string;
}

const BEFAST_ITEMS = [
  { key: "balance", letter: "B", label: "Balance", question: "Sudden loss of balance or coordination?" },
  { key: "eyes",    letter: "E", label: "Eyes",    question: "Sudden vision change or loss in one or both eyes?" },
  { key: "face",    letter: "F", label: "Face",    question: "Face drooping or uneven smile on one side?" },
  { key: "arm",     letter: "A", label: "Arm",     question: "Arm weakness or numbness on one side?" },
  { key: "speech",  letter: "S", label: "Speech",  question: "Slurred speech or difficulty speaking/understanding?" },
] as const;

const RISK_CONFIG = {
  High:   { bg: "bg-red-50 border-red-400",    text: "text-red-800",    badge: "bg-red-600 text-white",    icon: AlertTriangle },
  Medium: { bg: "bg-amber-50 border-amber-400", text: "text-amber-800",  badge: "bg-amber-500 text-white",  icon: AlertCircle },
  Low:    { bg: "bg-green-50 border-green-400", text: "text-green-800",  badge: "bg-green-600 text-white",  icon: CheckCircle2 },
};

export function EmergencyAssessment({ initialPatientId }: { initialPatientId?: string }) {
  const [form, setForm] = useState<BEFASTForm>({
    balance: "", eyes: "", face: "", arm: "", speech: "",
    symptom_onset: "", patient_name: "", patient_age: "",
  });
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [result, setResult] = useState<EmergencyAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packet, setPacket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingPacket, setLoadingPacket] = useState(false);

  const setAnswer = (key: keyof BEFASTForm, val: Answer) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canSubmit = BEFAST_ITEMS.every((item) => form[item.key] !== "") &&
    form.symptom_onset.trim() && form.patient_name.trim();

  const assess = async () => {
    setIsLoading(true);
    setResult(null);
    setPacket(null);
    try {
      const res = await assessBefast({
        balance: form.balance, eyes: form.eyes, face: form.face,
        arm: form.arm, speech: form.speech,
        symptom_onset: form.symptom_onset,
        patient_name: form.patient_name,
        patient_age: form.patient_age ? parseInt(form.patient_age) : undefined,
        patient_id: patientId || undefined,
      });
      setResult(res);
    } catch {
      // handle
    } finally {
      setIsLoading(false);
    }
  };

  const generatePacket = async () => {
    if (!patientId) return;
    setLoadingPacket(true);
    try {
      const res = await getEmergencyPacket(patientId);
      setPacket(res.packet_text);
    } finally {
      setLoadingPacket(false);
    }
  };

  const copyPacket = () => {
    if (packet) {
      navigator.clipboard.writeText(packet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setForm({ balance: "", eyes: "", face: "", arm: "", speech: "", symptom_onset: "", patient_name: "", patient_age: "" });
    setResult(null);
    setPacket(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Patient Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Patient Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Patient Name *</label>
            <Input value={form.patient_name} onChange={(e) => setForm((f) => ({ ...f, patient_name: e.target.value }))}
              placeholder="Enter patient name" className="bg-slate-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Age</label>
            <Input value={form.patient_age} onChange={(e) => setForm((f) => ({ ...f, patient_age: e.target.value }))}
              placeholder="e.g. 68" type="number" className="bg-slate-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Symptom Onset *</label>
            <Input value={form.symptom_onset} onChange={(e) => setForm((f) => ({ ...f, symptom_onset: e.target.value }))}
              placeholder="e.g. 45 minutes ago" className="bg-slate-50" />
          </div>
        </div>
      </div>

      {/* BEFAST Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-800 mb-5">BEFAST Assessment</h3>
        <div className="space-y-4">
          {BEFAST_ITEMS.map((item) => (
            <div key={item.key} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {item.letter}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 mb-2">{item.question}</p>
                <div className="flex gap-2">
                  {(["yes", "no", "unsure"] as const).map((val) => (
                    <button key={val} onClick={() => setAnswer(item.key, val)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize",
                        form[item.key] === val
                          ? val === "yes" ? "bg-red-600 text-white border-red-600"
                          : val === "no" ? "bg-green-600 text-white border-green-600"
                          : "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                      )}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={assess} disabled={!canSubmit || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700">
            {isLoading ? "Assessing..." : "Assess Stroke Risk"}
          </Button>
          {result && (
            <Button onClick={reset} variant="outline" className="flex-shrink-0">Reset</Button>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (() => {
        const cfg = RISK_CONFIG[result.risk_level];
        const Icon = cfg.icon;
        return (
          <div className={cn("rounded-2xl border-2 p-6 space-y-4", cfg.bg)}>
            <div className="flex items-center gap-3">
              <Icon className={cn("w-6 h-6", cfg.text)} />
              <span className={cn("text-xl font-bold", cfg.text)}>
                {result.risk_level} Risk
              </span>
              <span className={cn("ml-auto px-3 py-1 rounded-full text-sm font-bold", cfg.badge)}>
                Score: {result.risk_score}/5
              </span>
            </div>

            {result.risk_level === "High" && (
              <div className="bg-red-600 text-white rounded-xl p-4 flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">CALL 911 IMMEDIATELY</p>
                  <p className="text-red-200 text-sm">Every minute counts — 1.9 million neurons lost per minute</p>
                </div>
              </div>
            )}

            {result.positive_indicators.length > 0 && (
              <div>
                <p className={cn("text-xs font-semibold uppercase tracking-wide mb-2", cfg.text)}>
                  Positive Indicators
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.positive_indicators.map((ind, i) => (
                    <span key={i} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", cfg.bg, cfg.text)}>
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className={cn("text-xs font-semibold uppercase tracking-wide mb-2", cfg.text)}>
                Immediate Actions
              </p>
              <ol className="space-y-1.5">
                {result.immediate_actions.map((action, i) => (
                  <li key={i} className={cn("text-sm flex items-start gap-2", cfg.text)}>
                    <span className="font-bold flex-shrink-0">{i + 1}.</span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>

            <p className={cn("text-sm border-t pt-3", cfg.text, `border-current opacity-30`)}>
              {result.clinical_notes}
            </p>

            {patientId && (
              <div className="border-t pt-4">
                <p className={cn("text-xs font-semibold mb-2", cfg.text)}>Neurologist Handoff Packet</p>
                <Button onClick={generatePacket} disabled={loadingPacket} size="sm" variant="outline"
                  className="text-xs">
                  {loadingPacket ? "Generating..." : "Generate Patient Packet"}
                </Button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Packet */}
      {packet && (
        <div className="bg-slate-900 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white text-sm font-semibold">Neurologist Handoff Packet</p>
            <button onClick={copyPacket}
              className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-64 overflow-y-auto">
            {packet}
          </pre>
        </div>
      )}
    </div>
  );
}
