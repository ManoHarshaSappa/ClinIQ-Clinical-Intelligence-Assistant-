import Link from "next/link";
import { getPatients } from "@/lib/api";
import { PatientCard } from "@/components/PatientCard";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: { specialty?: string };
}) {
  let patients: Awaited<ReturnType<typeof getPatients>> = [];
  try {
    patients = await getPatients();
  } catch {
    return (
      <div className="p-8 text-center text-red-500">
        Could not connect to the backend. Make sure the FastAPI server is running.
      </div>
    );
  }

  const activeSpecialty = searchParams.specialty ?? "all";
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
        <Link href="/patients"
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            activeSpecialty === "all"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
          )}>
          All ({patients.length})
        </Link>
        {specialties.map((s) => (
          <Link key={s} href={`/patients?specialty=${encodeURIComponent(s)}`}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              activeSpecialty === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            )}>
            {s} ({patients.filter((p) => p.medical_specialty === s).length})
          </Link>
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
