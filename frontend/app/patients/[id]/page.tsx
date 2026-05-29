import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getPatient } from "@/lib/api";
import { PatientTabs } from "@/components/PatientTabs";
import { getSpecialtyBg, getSpecialtyBorder } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  let data;
  try {
    data = await getPatient(params.id);
  } catch {
    notFound();
  }

  const { patient, extracted_info, documents } = data;
  const hasAllergies = (extracted_info?.allergies ?? []).length > 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back nav */}
      <Link href="/patients" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mb-6">
        ← All Patients
      </Link>

      {/* Patient header */}
      <div className={cn("bg-white rounded-2xl border border-l-4 shadow-sm p-6 mb-6", getSpecialtyBorder(patient.medical_specialty))}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Avatar */}
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border-2 flex-shrink-0", getSpecialtyBg(patient.medical_specialty))}>
            {patient.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {patient.age && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {patient.age} years
                </span>
              )}
              {patient.gender && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {patient.gender}
                </span>
              )}
              {patient.medical_specialty && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", getSpecialtyBg(patient.medical_specialty))}>
                  {patient.medical_specialty}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {hasAllergies && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-semibold text-red-700">
                  {extracted_info!.allergies.length} Allerg{extracted_info!.allergies.length > 1 ? "ies" : "y"}
                </span>
              </div>
            )}
            <Link href={`/emergency?patient=${patient.id}`}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Emergency
            </Link>
          </div>
        </div>

        {/* Quick allergy strip */}
        {hasAllergies && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">⚠ Known Allergies</p>
            <div className="flex flex-wrap gap-2">
              {extracted_info!.allergies.map((a, i) => (
                <span key={i} className="text-xs bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-medium">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <PatientTabs patient={patient} extractedInfo={extracted_info} documents={documents} />
    </div>
  );
}
