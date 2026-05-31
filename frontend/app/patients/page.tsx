"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPatients, type Patient } from "@/lib/api";
import { PatientCard } from "@/components/PatientCard";
import { Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpecialty, setActiveSpecialty] = useState("all");

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoading(true);
        const patientsData = await getPatients();
        setPatients(patientsData);
        console.log('Patients loaded successfully:', patientsData.length);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
        setError('Failed to load patients. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  useEffect(() => {
    // Get specialty from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const specialty = urlParams.get('specialty') || 'all';
    setActiveSpecialty(specialty);
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            <span className="text-sm md:text-base">Loading patients...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
          <div className="text-red-600 font-medium mb-2 text-sm md:text-base">Error Loading Patients</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2.5 md:py-2 rounded-lg text-sm hover:bg-red-700 transition-colors touch-target"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const specialties = Array.from(
    new Set(patients.map((p) => p.medical_specialty).filter(Boolean))
  ) as string[];

  const filtered =
    activeSpecialty === "all"
      ? patients
      : patients.filter((p) => p.medical_specialty === activeSpecialty);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">{patients.length} total records</p>
        </div>
        <Link href="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:py-2 rounded-xl text-sm font-medium transition-colors touch-target text-center sm:text-left">
          + Upload Record
        </Link>
      </div>

      {/* Specialty filter */}
      <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
        <button
          onClick={() => {
            setActiveSpecialty("all");
            window.history.pushState({}, '', '/patients');
          }}
          className={cn(
            "px-3 md:px-4 py-2 md:py-1.5 rounded-full text-xs md:text-sm font-medium border transition-colors touch-target",
            activeSpecialty === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
          )}>
          All ({patients.length})
        </button>
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => {
              setActiveSpecialty(s);
              window.history.pushState({}, '', `/patients?specialty=${encodeURIComponent(s)}`);
            }}
            className={cn(
              "px-3 md:px-4 py-2 md:py-1.5 rounded-full text-xs md:text-sm font-medium border transition-colors touch-target",
              activeSpecialty === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}>
            {s.length > 15 ? `${s.substring(0, 15)}...` : s} ({patients.filter((p) => p.medical_specialty === s).length})
          </button>
        ))}
      </div>

      {/* Patient grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 md:py-24 text-slate-400">
          <Users className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base md:text-lg font-medium text-slate-500">No patients found</p>
          <p className="text-sm md:text-base mt-2">
            <Link href="/upload" className="text-blue-500 hover:underline touch-target">Upload a medical record</Link> to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}
