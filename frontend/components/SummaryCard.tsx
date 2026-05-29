import { AlertTriangle, Pill, Stethoscope, FlaskConical, FileText } from "lucide-react";
import { ExtractedInfo, Patient } from "@/lib/api";
import { getSpecialtyBg, cn } from "@/lib/utils";

interface Props {
  patient: Patient;
  extractedInfo: ExtractedInfo | null;
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b", color)}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function TagList({ items, variant }: { items: string[]; variant: "default" | "red" | "blue" | "green" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    red:     "bg-red-50 text-red-700 border-red-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
    green:   "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", styles[variant])}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function SummaryCard({ patient, extractedInfo }: Props) {
  const info = extractedInfo;
  const hasMeds      = (info?.medications?.length ?? 0) > 0;
  const hasAllergies = (info?.allergies?.length ?? 0) > 0;
  const hasDiagnoses = (info?.diagnoses?.length ?? 0) > 0;
  const hasLabs      = (info?.lab_results?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* Clinical Summary */}
      {info?.summary_text && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Clinical Summary</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed italic">{info.summary_text}</p>
        </div>
      )}

      {/* Allergies — most prominent, always at top */}
      {hasAllergies && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-100 border-b border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              ⚠ Known Allergies
            </span>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {info!.allergies.map((a, i) => (
                <span key={i} className="text-sm bg-red-100 text-red-800 border border-red-300 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two columns: Diagnoses + Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasDiagnoses && (
          <Section icon={Stethoscope} title="Diagnoses" color="bg-violet-50 text-violet-700 border-violet-100">
            <TagList items={info!.diagnoses} variant="default" />
          </Section>
        )}

        {hasMeds && (
          <Section icon={Pill} title="Medications" color="bg-blue-50 text-blue-700 border-blue-100">
            <ul className="space-y-1.5">
              {info!.medications.map((med, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {med}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* Lab Results */}
      {hasLabs && (
        <Section icon={FlaskConical} title="Lab Results" color="bg-emerald-50 text-emerald-700 border-emerald-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {info!.lab_results.map((lab, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600 truncate mr-2">{lab.test}</span>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-slate-900">
                    {lab.value}
                    {lab.unit && <span className="text-xs font-normal text-slate-500 ml-1">{lab.unit}</span>}
                  </span>
                  {lab.date && (
                    <p className="text-xs text-slate-400 leading-none mt-0.5">{lab.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Empty state */}
      {!hasDiagnoses && !hasMeds && !hasAllergies && !hasLabs && !info?.summary_text && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No clinical data extracted yet</p>
          <p className="text-xs mt-1">Upload a patient record or run re-extraction</p>
        </div>
      )}
    </div>
  );
}
