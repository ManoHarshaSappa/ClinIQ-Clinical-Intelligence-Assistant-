"use client";
import { useState } from "react";
import { getInsights, InsightsResponse } from "@/lib/api";
import { Sparkles, AlertCircle, CheckCircle2, Pill, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700 border-red-300",
  High:   "bg-orange-100 text-orange-700 border-orange-300",
  Normal: "bg-green-100 text-green-700 border-green-300",
  Low:    "bg-slate-100 text-slate-600 border-slate-300",
};

export function AIInsights({ patientId }: { patientId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setState("loading");
    setError(null);
    try {
      const result = await getInsights(patientId);
      setData(result);
      setState("loaded");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate insights");
      setState("error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <h3 className="font-semibold text-white">AI Clinical Insights</h3>
        </div>
        <p className="text-violet-200 text-xs mt-0.5">Powered by GPT-4o — based on patient records</p>
      </div>

      <div className="p-6">
        {state === "idle" && (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">Generate AI-powered clinical insights for this patient</p>
            <Button onClick={generate} className="bg-violet-600 hover:bg-violet-700">
              Generate Insights
            </Button>
          </div>
        )}

        {state === "loading" && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm animate-pulse">Analyzing patient data with GPT-4o...</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center py-6">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <Button onClick={generate} variant="outline" size="sm">Try Again</Button>
          </div>
        )}

        {state === "loaded" && data && (
          <div className="space-y-5">
            {/* Priority badge */}
            <div className="flex items-center gap-3">
              <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border", PRIORITY_STYLES[data.follow_up_priority])}>
                {data.follow_up_priority === "Urgent" ? "🚨" : data.follow_up_priority === "High" ? "⚠️" : data.follow_up_priority === "Normal" ? "✅" : "ℹ️"}{" "}
                {data.follow_up_priority} Priority
              </span>
              <p className="text-xs text-slate-500 flex-1">{data.follow_up_rationale}</p>
            </div>

            <hr className="border-slate-100" />

            {/* Clinical Concerns */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h4 className="font-semibold text-slate-800 text-sm">Clinical Concerns</h4>
              </div>
              <ul className="space-y-1.5">
                {data.clinical_concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h4 className="font-semibold text-slate-800 text-sm">Recommended Actions</h4>
              </div>
              <ul className="space-y-1.5">
                {data.recommended_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Drug Safety */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-amber-600" />
                <h4 className="font-semibold text-amber-800 text-sm">Drug Safety Watch</h4>
              </div>
              <p className="text-sm text-amber-700">{data.drug_safety_watch}</p>
            </div>

            <button onClick={generate} className="text-xs text-slate-400 hover:text-violet-600 flex items-center gap-1 transition-colors">
              <Clock className="w-3 h-3" /> Regenerate insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
