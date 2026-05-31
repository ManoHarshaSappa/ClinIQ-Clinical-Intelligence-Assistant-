"use client";
import { useState } from "react";
import { Patient, ExtractedInfo, PatientDocument, getDocumentText } from "@/lib/api";
import { SummaryCard } from "@/components/SummaryCard";
import { ChatWindow } from "@/components/ChatWindow";
import { AIInsights } from "@/components/AIInsights";
import { DrugInteractionChecker } from "@/components/DrugInteractionChecker";
import { FileText, MessageSquare, Sparkles, Pill, FolderOpen, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  patient: Patient;
  extractedInfo: ExtractedInfo | null;
  documents: PatientDocument[];
}

const TABS = [
  { id: "overview",  label: "Overview",    icon: FileText },
  { id: "chat",      label: "AI Chat",     icon: MessageSquare },
  { id: "insights",  label: "AI Insights", icon: Sparkles },
  { id: "drugs",     label: "Drug Checker",icon: Pill },
  { id: "documents", label: "Documents",   icon: FolderOpen },
] as const;

type TabId = typeof TABS[number]["id"];

function DocumentPreviewModal({
  docId, docName, onClose,
}: { docId: string; docName: string; onClose: () => void }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    getDocumentText(docId)
      .then((d) => setText(d.raw_text))
      .catch(() => setText("Could not load document text."))
      .finally(() => setLoading(false));
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 text-sm truncate">{docName}</p>
              <p className="text-xs text-slate-400">Raw document text</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 md:w-8 md:h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors touch-target flex-shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <pre className="text-xs md:text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200">
              {text}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export function PatientTabs({ patient, extractedInfo, documents }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [previewDoc, setPreviewDoc] = useState<{ id: string; name: string } | null>(null);

  return (
    <div>
      {/* Tab bar - Mobile optimized */}
      <div className="flex border-b border-slate-200 mb-4 md:mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0 touch-target",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}>
            <tab.icon className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.length > 8 ? `${tab.label.substring(0, 8)}...` : tab.label}</span>
            {tab.id === "documents" && documents.length > 0 && (
              <span className="bg-slate-200 text-slate-600 text-xs rounded-full px-1.5 py-0.5 leading-none">
                {documents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview"  && <SummaryCard patient={patient} extractedInfo={extractedInfo} />}
      {activeTab === "chat"      && <ChatWindow patientId={patient.id} />}
      {activeTab === "insights"  && <AIInsights patientId={patient.id} />}
      {activeTab === "drugs"     && <DrugInteractionChecker patientId={patient.id} />}

      {activeTab === "documents" && (
        <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">Uploaded Documents</h3>
            <span className="text-xs text-slate-400">{documents.length} file{documents.length !== 1 ? "s" : ""} on record</span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8 md:py-10 text-slate-400">
              <FolderOpen className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No documents uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {documents.map((doc) => (
                <div key={doc.id}
                  className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 hover:bg-blue-50 rounded-lg md:rounded-xl border border-slate-100 hover:border-blue-200 transition-all group">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.file_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewDoc({ id: doc.id, name: doc.file_name })}
                    className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-blue-600 hover:bg-blue-100 px-3 py-2 md:py-1.5 rounded-lg transition-all flex-shrink-0 touch-target">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document preview modal */}
      {previewDoc && (
        <DocumentPreviewModal
          docId={previewDoc.id}
          docName={previewDoc.name}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
