"use client";
import { useState } from "react";
import { checkDrug, DrugCheckResponse } from "@/lib/api";
import { Pill, CheckCircle2, AlertTriangle, XCircle, Shield, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  safe:    { icon: CheckCircle2,  bg: "bg-green-50 border-green-200",  text: "text-green-800",  badge: "bg-green-600",  label: "Safe to Prescribe" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 border-amber-200",  text: "text-amber-800",  badge: "bg-amber-500",  label: "Caution Required" },
  danger:  { icon: XCircle,       bg: "bg-red-50 border-red-200",      text: "text-red-800",    badge: "bg-red-600",    label: "Do Not Prescribe" },
};

export function DrugInteractionChecker({ patientId }: { patientId: string }) {
  const [drugName, setDrugName] = useState("");
  const [result, setResult] = useState<DrugCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    if (!drugName.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await checkDrug(patientId, drugName.trim());
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Check failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-white" />
            <h3 className="font-semibold text-white">Drug Interaction Checker</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
            <Shield className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-medium">OpenFDA + GPT-4o</span>
          </div>
        </div>
        <p className="text-blue-200 text-xs mt-0.5">Real FDA label data + AI analysis against patient records</p>
      </div>

      <div className="p-6">
        {/* Input */}
        <div className="flex gap-2 mb-5">
          <Input
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Enter drug name (e.g., Warfarin, Amoxicillin, Metoprolol)"
            disabled={isLoading}
            className="bg-slate-50"
          />
          <Button onClick={check} disabled={isLoading || !drugName.trim()} className="flex-shrink-0">
            {isLoading ? "Checking..." : "Check"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Checking FDA database...</p>
            <p className="text-slate-400 text-xs mt-1">Pulling real drug label + analyzing against patient records</p>
          </div>
        )}

        {result && !isLoading && (() => {
          const cfg = STATUS_CONFIG[result.status];
          const Icon = cfg.icon;
          return (
            <div className="space-y-4">
              {/* Black box warning — most serious */}
              {result.has_boxed_warning && (
                <div className="bg-black text-white rounded-xl p-4 flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-yellow-400 text-sm">FDA BLACK BOX WARNING</p>
                    <p className="text-gray-300 text-xs mt-1">
                      This drug carries the FDA's most serious warning. Review the full label before prescribing.
                    </p>
                  </div>
                </div>
              )}

              {/* Status card */}
              <div className={cn("rounded-xl border-2 p-5 space-y-4", cfg.bg)}>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.badge)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={cn("font-bold", cfg.text)}>{cfg.label}</p>
                    <p className={cn("text-sm", cfg.text)}>{result.summary}</p>
                  </div>
                </div>

                {/* Drug name info */}
                <div className="flex flex-wrap items-center gap-2">
                  {result.normalized_name && result.normalized_name.toLowerCase() !== drugName.toLowerCase() && (
                    <span className="text-xs bg-white/70 border px-2 py-0.5 rounded-full text-slate-600">
                      Normalized: {result.normalized_name}
                    </span>
                  )}
                  {result.brand_names?.length > 0 && (
                    <span className="text-xs bg-white/70 border px-2 py-0.5 rounded-full text-slate-600">
                      Brand: {result.brand_names.slice(0, 2).join(", ")}
                    </span>
                  )}
                  {result.fda_found && (
                    <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" /> FDA Label Found
                    </span>
                  )}
                </div>

                {/* Interactions */}
                {result.interactions.length > 0 && (
                  <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wide mb-2", cfg.text)}>
                      Drug Interactions
                    </p>
                    <ul className="space-y-1.5">
                      {result.interactions.map((item, i) => (
                        <li key={i} className={cn("text-sm flex items-start gap-2", cfg.text)}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Allergy flags */}
                {result.allergy_flags.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-red-700 mb-2">
                      ⚠ Allergy Flags
                    </p>
                    <ul className="space-y-1.5">
                      {result.allergy_flags.map((flag, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-red-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendation */}
                <div className={cn("border-t pt-3 text-sm font-medium", cfg.text, "border-current/20")}>
                  💊 {result.recommendation}
                </div>
              </div>

              {/* FDA raw text (collapsible) */}
              {result.fda_interactions_text && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-slate-400 hover:text-blue-500 transition-colors">
                    View raw FDA label text →
                  </summary>
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-200 leading-relaxed">
                    {result.fda_interactions_text}
                  </div>
                </details>
              )}
            </div>
          );
        })()}

        {!result && !isLoading && !error && (
          <div className="text-center py-6 text-slate-400">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Type a drug name and press Check</p>
            <p className="text-xs mt-1">Pulls real FDA data + checks against this patient's records</p>
          </div>
        )}
      </div>
    </div>
  );
}
