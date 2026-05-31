"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getPatient, type PatientDetail } from "@/lib/api";
import { PatientTabs } from "@/components/PatientTabs";
import { getSpecialtyBg, getSpecialtyBorder } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function PatientDetailPage() {
  const params = useParams();
  const [data, setData] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient(retryCount = 0) {
      try {
        setLoading(true);
        setError(null);

        // Add small delay for retries to handle race conditions
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const patientData = await getPatient(params.id as string);
        setData(patientData);
        console.log('Patient data loaded successfully:', patientData);
      } catch (error) {
        console.error(`Failed to fetch patient (attempt ${retryCount + 1}):`, error);

        // Retry once for network/timing issues
        if (retryCount < 1) {
          console.log('Retrying patient fetch...');
          return fetchPatient(retryCount + 1);
        }

        setError(`Failed to load patient details. This may be due to browser caching or extension issues. Please try refreshing the page.`);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPatient();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            <span className="text-sm md:text-base">Loading patient details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <Link href="/patients" className="hidden lg:inline-flex text-sm text-blue-600 hover:underline items-center gap-1 mb-6">
          ← All Patients
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
          <div className="text-red-600 font-medium mb-2 text-sm md:text-base">Patient Not Found</div>
          <div className="text-red-500 text-xs md:text-sm mb-4">{error || 'Could not load patient details'}</div>
          <Link href="/patients" className="bg-red-600 text-white px-4 py-2.5 md:py-2 rounded-lg text-sm hover:bg-red-700 transition-colors touch-target">
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  const { patient, extracted_info, documents } = data;
  const hasAllergies = (extracted_info?.allergies ?? []).length > 0;

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Desktop Back nav - hidden on mobile */}
      <Link href="/patients" className="hidden lg:inline-flex text-sm text-blue-600 hover:underline items-center gap-1 mb-6">
        ← All Patients
      </Link>

      {/* Patient header */}
      <div className={cn("bg-white rounded-xl md:rounded-2xl border border-l-4 shadow-sm p-4 md:p-5 lg:p-6 mb-4 md:mb-6", getSpecialtyBorder(patient.medical_specialty))}>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* Avatar */}
          <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold border-2 flex-shrink-0", getSpecialtyBg(patient.medical_specialty))}>
            {patient.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">{patient.name}</h1>
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

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {hasAllergies && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-semibold text-red-700">
                  {extracted_info!.allergies.length} Allerg{extracted_info!.allergies.length > 1 ? "ies" : "y"}
                </span>
              </div>
            )}
            <Link href={`/emergency?patient=${patient.id}`}
              className="text-xs md:text-sm bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-medium transition-colors flex items-center gap-1.5 touch-target">
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
    </ErrorBoundary>
  );
}
