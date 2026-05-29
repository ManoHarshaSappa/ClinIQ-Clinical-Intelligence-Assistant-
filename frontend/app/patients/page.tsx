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
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading patients...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 font-medium mb-2">Error Loading Patients</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500 text-sm mt-1">{patients.length} total records</p>
        </div>
        <Link href="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Upload Record
        </Link>
      </div>

      {/* Specialty filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => {
            setActiveSpecialty("all");
            window.history.pushState({}, '', '/patients');
          }}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
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
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeSpecialty === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}>
            {s} ({patients.filter((p) => p.medical_specialty === s).length})
          </button>
        ))}
      </div>

      {/* Patient grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-slate-500">No patients found</p>
          <p className="text-sm mt-1">
            <Link href="/upload" className="text-blue-500 hover:underline">Upload a medical record</Link> to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </div>
  );
}
