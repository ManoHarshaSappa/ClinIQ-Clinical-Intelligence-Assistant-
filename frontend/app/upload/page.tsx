import { FileUpload } from "@/components/FileUpload";
import { Upload, FileText, Database, MessageCircle } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload Medical Records</h1>
        <p className="text-slate-500 mt-1">Upload multiple patient medical records — AI extracts everything automatically.</p>
      </div>

      <FileUpload />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: FileText,
            title: "Auto Extract",
            desc: "Medications, diagnoses, allergies, labs",
            color: "text-blue-600"
          },
          {
            icon: Database,
            title: "Smart Search",
            desc: "Stored in vector database for search",
            color: "text-purple-600"
          },
          {
            icon: MessageCircle,
            title: "AI Chat Ready",
            desc: "Ask questions immediately",
            color: "text-green-600"
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-lg border border-slate-200 p-6">
            <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
            <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
