"use client";
import { useState } from "react";
import { Pill, AlertTriangle, CheckCircle, XCircle, Search, MessageCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DrugInteractionResult {
  severity: "safe" | "caution" | "contraindicated";
  title: string;
  description: string;
  recommendations: string[];
}

interface DrugInfoResult {
  answer: string;
  sources: string[];
}

export default function DrugCheckerPage() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "interactions">("knowledge");

  // Drug Interaction State
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [isInteractionLoading, setIsInteractionLoading] = useState(false);
  const [interactionResult, setInteractionResult] = useState<DrugInteractionResult | null>(null);

  // Drug Information State
  const [drugQuestion, setDrugQuestion] = useState("");
  const [isInfoLoading, setIsInfoLoading] = useState(false);
  const [infoResult, setInfoResult] = useState<DrugInfoResult | null>(null);

  const checkInteraction = async () => {
    if (!drug1.trim() || !drug2.trim()) return;

    setIsInteractionLoading(true);

    try {
      const response = await fetch('/api/drug-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drug1: drug1.trim(), drug2: drug2.trim() })
      });

      const data = await response.json();
      setInteractionResult(data);
    } catch (error) {
      console.error('Drug interaction check failed:', error);
      setInteractionResult({
        severity: "caution",
        title: "Check Failed",
        description: "Unable to check drug interaction. Please consult a pharmacist.",
        recommendations: ["Verify drugs manually", "Consult clinical pharmacist"]
      });
    } finally {
      setIsInteractionLoading(false);
    }
  };

  const askDrugQuestion = async () => {
    if (!drugQuestion.trim()) return;

    setIsInfoLoading(true);

    try {
      const response = await fetch('/api/drug-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: drugQuestion.trim() })
      });

      const data = await response.json();
      setInfoResult(data);
    } catch (error) {
      console.error('Drug info query failed:', error);
      setInfoResult({
        answer: "Unable to retrieve drug information at this time. Please consult a clinical pharmacist or drug reference.",
        sources: []
      });
    } finally {
      setIsInfoLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "safe":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "caution":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "contraindicated":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Pill className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "safe":
        return "border-green-500 bg-green-50";
      case "caution":
        return "border-yellow-500 bg-yellow-50";
      case "contraindicated":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Pill className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Drug Checker</h1>
        </div>
        <p className="text-slate-500 text-sm md:text-base">
          Check drug interactions and get clinical information about medications.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 md:mb-8">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-md text-sm font-medium transition-colors touch-target flex-1 sm:flex-initial ${
              activeTab === "knowledge"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Drug Knowledge</span>
            <span className="sm:hidden">Knowledge</span>
          </button>
          <button
            onClick={() => setActiveTab("interactions")}
            className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-md text-sm font-medium transition-colors touch-target flex-1 sm:flex-initial ${
              activeTab === "interactions"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Compare 2 Drugs</span>
            <span className="sm:hidden">Compare</span>
          </button>
        </div>
      </div>

      {/* Drug Knowledge Tab */}
      {activeTab === "interactions" && (
        <>
          <Card className="p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg md:text-xl font-semibold">Compare Drug Interactions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Drug 1
                </label>
                <Input
                  value={drug1}
                  onChange={(e) => setDrug1(e.target.value)}
                  placeholder="e.g., Metformin, Lisinopril"
                  className="w-full touch-target text-base md:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Drug 2
                </label>
                <Input
                  value={drug2}
                  onChange={(e) => setDrug2(e.target.value)}
                  placeholder="e.g., Furosemide, Warfarin"
                  className="w-full touch-target text-base md:text-sm"
                />
              </div>
            </div>

            <Button
              onClick={checkInteraction}
              disabled={isInteractionLoading || !drug1.trim() || !drug2.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 touch-target py-3 md:py-2"
            >
              {isInteractionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Checking...</span>
                  <span className="sm:hidden">Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Check Interaction
                </>
              )}
            </Button>
          </Card>

          {/* Interaction Results */}
          {interactionResult && (
            <Card className={`p-4 md:p-6 border-2 ${getSeverityColor(interactionResult.severity)} mb-6 md:mb-8`}>
              <div className="flex items-start gap-3 md:gap-4">
                {getSeverityIcon(interactionResult.severity)}

                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">
                    {interactionResult.title}
                  </h3>

                  <p className="text-slate-700 mb-4 leading-relaxed text-sm md:text-base">
                    {interactionResult.description}
                  </p>

                  {interactionResult.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2 text-sm md:text-base">
                        Clinical Recommendations:
                      </h4>
                      <ul className="space-y-2">
                        {interactionResult.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Quick Examples */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">Common Drug Interaction Checks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[
                ["Warfarin", "Aspirin"],
                ["Metformin", "Contrast Dye"],
                ["Lisinopril", "Spironolactone"],
                ["Digoxin", "Furosemide"],
                ["Simvastatin", "Amiodarone"],
                ["Phenytoin", "Warfarin"]
              ].map(([d1, d2], index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDrug1(d1);
                    setDrug2(d2);
                  }}
                  className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors touch-target"
                >
                  <div className="text-sm font-medium text-slate-900">{d1} + {d2}</div>
                  <div className="text-xs text-slate-500 mt-1">Tap to check</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Compare 2 Drugs Tab */}
      {activeTab === "knowledge" && (
        <>
          <Card className="p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg md:text-xl font-semibold">Ask About Drugs</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Question
              </label>
              <Input
                value={drugQuestion}
                onChange={(e) => setDrugQuestion(e.target.value)}
                placeholder="e.g., What is the mechanism of action of Metformin?"
                className="w-full touch-target text-base md:text-sm"
                onKeyDown={(e) => e.key === "Enter" && askDrugQuestion()}
              />
            </div>

            <Button
              onClick={askDrugQuestion}
              disabled={isInfoLoading || !drugQuestion.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 touch-target py-3 md:py-2"
            >
              {isInfoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Getting information...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4" />
                  Get Drug Information
                </>
              )}
            </Button>
          </Card>

          {/* Information Results */}
          {infoResult && (
            <Card className="p-4 md:p-6 border-2 border-blue-200 bg-blue-50 mb-6 md:mb-8">
              <div className="flex items-start gap-3 md:gap-4">
                <MessageCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />

                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                    Drug Information
                  </h3>

                  <div className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap text-sm md:text-base">
                    {infoResult.answer}
                  </div>

                  {infoResult.sources && infoResult.sources.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2 text-sm md:text-base">
                        Sources:
                      </h4>
                      <ul className="space-y-2">
                        {infoResult.sources.map((source, index) => (
                          <li key={index} className="text-xs md:text-sm text-slate-600 bg-white p-3 md:p-2 rounded border">
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Sample Questions */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">Sample Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
                "What is the mechanism of action of Metformin?",
                "What are the side effects of Lisinopril?",
                "How does Warfarin work?",
                "What is the dosing for Furosemide in heart failure?",
                "What are contraindications for ACE inhibitors?",
                "How should I monitor patients on Digoxin?"
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => setDrugQuestion(question)}
                  className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors touch-target"
                >
                  <div className="text-sm text-slate-700">{question}</div>
                  <div className="text-xs text-slate-500 mt-1">Tap to ask</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clinical Notes */}
      <div className="p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2 text-sm md:text-base">Clinical Notes</h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Always verify drug interactions with current patient allergies and medical conditions</li>
          <li>• Consider patient age, kidney function, and liver function when assessing medications</li>
          <li>• Consult clinical pharmacist for complex medication regimens</li>
          <li>• Use clinical judgment and institutional protocols for final prescribing decisions</li>
        </ul>
      </div>
    </div>
  );
}