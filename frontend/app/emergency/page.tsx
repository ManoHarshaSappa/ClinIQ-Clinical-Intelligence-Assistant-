import { AlertTriangle, Brain, Phone, FileText, Truck, Hospital, ChevronRight } from "lucide-react";
import { EmergencyAssessment } from "@/components/EmergencyAssessment";

const FLOW_STEPS = [
  { icon: Brain,        color: "bg-red-100 text-red-600",    label: "Symptoms Appear",   desc: "Patient shows sudden neurological symptoms" },
  { icon: AlertTriangle,color: "bg-orange-100 text-orange-600", label: "BEFAST Check",   desc: "Doctor answers 5 questions in 2 minutes" },
  { icon: FileText,     color: "bg-blue-100 text-blue-600",  label: "AI Scores Risk",    desc: "ClinIQ gives High / Medium / Low verdict" },
  { icon: Phone,        color: "bg-red-100 text-red-600",    label: "911 Called",        desc: "One decision — immediate ambulance dispatch" },
  { icon: FileText,     color: "bg-violet-100 text-violet-600", label: "Packet Sent",   desc: "Patient history sent to neurologist instantly" },
  { icon: Truck,        color: "bg-amber-100 text-amber-600",label: "Transport",         desc: "Patient en route to stroke center" },
  { icon: Hospital,     color: "bg-green-100 text-green-600",label: "Hospital Ready",    desc: "Team prepared before patient arrives" },
];

export default function EmergencyPage({ searchParams }: { searchParams: { patient?: string } }) {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Emergency Stroke Assessment</h1>
              <p className="text-red-200 text-sm mt-0.5">BEFAST Screening Tool — Powered by ClinIQ</p>
            </div>
          </div>

          {/* Key stat */}
          <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 inline-flex items-center gap-3">
            <Brain className="w-5 h-5 text-red-200 flex-shrink-0" />
            <p className="text-white text-sm">
              Every <span className="font-bold text-yellow-300">1 minute</span> of stroke =
              <span className="font-bold text-yellow-300"> 1.9 million neurons</span> lost permanently
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

        {/* The assessment form - NOW ON TOP */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-2xl">Start Emergency Assessment</h2>
              <p className="text-slate-600 text-sm">Complete BEFAST screening in 2 minutes</p>
            </div>
          </div>
          <EmergencyAssessment initialPatientId={searchParams.patient} />
        </div>

        {/* How it works — visual flow */}
        <div className="bg-slate-50 rounded-lg p-6">
          <h2 className="font-bold text-slate-800 mb-1">How This Works</h2>
          <p className="text-slate-500 text-sm mb-6">
            A small clinic with no neurologist on-site becomes a full stroke entry point.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {FLOW_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center text-center w-24">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{step.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{step.desc}</p>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mb-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What is BEFAST */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="font-bold text-white mb-4">What is BEFAST?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { letter: "B", label: "Balance",  q: "Sudden loss of balance or coordination?" },
              { letter: "E", label: "Eyes",     q: "Sudden change in vision in one or both eyes?" },
              { letter: "F", label: "Face",     q: "Is one side of the face drooping?" },
              { letter: "A", label: "Arm",      q: "Is one arm weak or numb?" },
              { letter: "S", label: "Speech",   q: "Is speech slurred or strange?" },
              { letter: "T", label: "Time",     q: "Note the exact time symptoms started" },
            ].map((item) => (
              <div key={item.letter} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {item.letter}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.label}</p>
                  <p className="text-slate-400 text-xs">{item.q}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-300 text-sm">
              <span className="text-yellow-400 font-bold">Face + Arm + Speech</span> positive together = classic stroke triad.
              If any 3 symptoms are YES → <span className="text-red-400 font-bold">HIGH RISK — Call 911 immediately.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
