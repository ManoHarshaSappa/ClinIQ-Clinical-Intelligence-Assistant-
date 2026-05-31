import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Patient } from "@/lib/api";
import { getSpecialtyBg, getSpecialtyBorder, cn } from "@/lib/utils";

export function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Link href={`/patients/${patient.id}`}>
      <div className={cn(
        "bg-white rounded-xl md:rounded-2xl border border-l-4 shadow-sm p-4 md:p-5 hover:shadow-md transition-all cursor-pointer h-full touch-target",
        getSpecialtyBorder(patient.medical_specialty)
      )}>
        <div className="flex items-start gap-3 md:gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center text-sm font-bold border flex-shrink-0",
            getSpecialtyBg(patient.medical_specialty)
          )}>
            {patient.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-base md:text-lg text-slate-900 truncate">{patient.name}</p>
              {(patient.allergy_count ?? 0) > 0 && (
                <div className="flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md flex-shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-semibold">{patient.allergy_count}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-1.5">
              {patient.age && (
                <span className="text-xs md:text-sm bg-slate-100 text-slate-600 px-2 py-1 md:py-0.5 rounded-full">
                  {patient.age}y
                </span>
              )}
              {patient.gender && (
                <span className="text-xs md:text-sm bg-slate-100 text-slate-600 px-2 py-1 md:py-0.5 rounded-full">
                  {patient.gender}
                </span>
              )}
              {patient.medical_specialty && (
                <span className={cn("text-xs md:text-sm px-2 py-1 md:py-0.5 rounded-full border font-medium", getSpecialtyBg(patient.medical_specialty))}>
                  {patient.medical_specialty}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {new Date(patient.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
