"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Users, FileText, Database, Activity, AlertTriangle, Upload, Shield, Pill } from "lucide-react";
import { getStats, getPatients, type Patient, type StatsResponse } from "@/lib/api";
import { getSpecialtyBg, getSpecialtyBorder } from "@/lib/utils";
import { FileUpload } from "@/components/FileUpload";
import { MobileSpecialtyChart } from "@/components/MobileSpecialtyChart";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse>({
    total_patients: 0,
    total_documents: 0,
    total_embeddings: 0,
    specialty_breakdown: {} as Record<string, number>
  });
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsData, patientsData] = await Promise.all([getStats(), getPatients()]);
        setStats(statsData);
        setRecentPatients(patientsData);
        console.log('Dashboard data loaded successfully:', { statsData, patientsCount: patientsData.length });
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        // Keep default values
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const maxSpecialtyCount = Math.max(...Object.values(stats.specialty_breakdown), 1);
  const critical = recentPatients.filter((p) => (p.allergy_count ?? 0) > 1);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Clinical Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        {loading && (
          <div className="mt-2 flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading dashboard data...</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {[
          { label: "Total Patients", value: stats.total_patients, icon: Users, color: "blue" },
          { label: "Specialties", value: Object.keys(stats.specialty_breakdown).length, icon: Activity, color: "violet" },
          { label: "Documents", value: stats.total_documents, icon: FileText, color: "emerald" },
          { label: "Embeddings", value: stats.total_embeddings.toLocaleString(), icon: Database, color: "amber" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl md:rounded-2xl border border-slate-200 p-3 md:p-4 lg:p-5 flex items-center gap-3 md:gap-4 shadow-sm">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-${s.color}-50 flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-5 h-5 md:w-6 md:h-6 text-${s.color}-600`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 truncate">{s.value}</p>
              <p className="text-xs md:text-sm text-slate-500 truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: recent patients + specialty chart */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 text-base md:text-lg">Recent Patients</h2>
              <Link href="/patients" className="text-sm md:text-base text-blue-600 hover:underline touch-target">View all →</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentPatients.slice(0, 6).map((p) => (
                <Link key={p.id} href={`/patients/${p.id}`}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-3.5 hover:bg-slate-50 transition-colors touch-target">
                  <div className={`w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs font-bold border ${getSpecialtyBg(p.medical_specialty)}`}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm md:text-base truncate">{p.name}</p>
                    <p className="text-xs md:text-sm text-slate-400 truncate">{p.medical_specialty ?? "Unknown"}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.age && <span className="text-xs md:text-sm text-slate-400">{p.age}y</span>}
                    {(p.allergy_count ?? 0) > 0 && (
                      <span className="text-xs md:text-sm bg-red-100 text-red-600 px-2 py-1 md:py-0.5 rounded-full font-medium">
                        {p.allergy_count} allergies
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              {recentPatients.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-8">No patients yet. Upload a record to get started.</p>
              )}
            </div>
          </div>

          {/* Mobile Specialty Chart */}
          {Object.keys(stats.specialty_breakdown).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:hidden">
              <MobileSpecialtyChart specialtyBreakdown={stats.specialty_breakdown} />
            </div>
          )}

          {/* Desktop Specialty Breakdown */}
          {Object.keys(stats.specialty_breakdown).length > 0 && (
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-5">Patients by Specialty</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Circular Progress Indicators */}
                <div className="space-y-4">
                  {Object.entries(stats.specialty_breakdown)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([spec, count], index) => {
                      const percentage = (count / maxSpecialtyCount) * 100;
                      const colors = ['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan'];
                      const color = colors[index % colors.length];

                      return (
                        <div key={spec} className="flex items-center gap-4">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={`rgb(${
                                  color === 'blue' ? '59 130 246' :
                                  color === 'emerald' ? '16 185 129' :
                                  color === 'violet' ? '139 92 246' :
                                  color === 'amber' ? '245 158 11' :
                                  color === 'rose' ? '244 63 94' :
                                  '6 182 212'
                                })`}
                                strokeWidth="3"
                                strokeDasharray={`${percentage}, 100`}
                                className="transition-all duration-1000 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-xs font-bold text-${color}-600`}>{count}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{spec}</p>
                            <p className="text-xs text-slate-500">{percentage.toFixed(0)}% of max</p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Right: Line Chart Style */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl p-4">
                  <div className="absolute inset-4">
                    <svg className="w-full h-full" viewBox="0 0 200 120">
                      {/* Grid lines */}
                      {[20, 40, 60, 80, 100].map((y) => (
                        <line
                          key={y}
                          x1="10"
                          y1={110 - y}
                          x2="190"
                          y2={110 - y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      ))}

                      {/* Specialty bars as vertical lines */}
                      {Object.entries(stats.specialty_breakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 8)
                        .map(([spec, count], index) => {
                          const x = 20 + (index * 20);
                          const height = (count / maxSpecialtyCount) * 90;
                          const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5a', '#06b6d4', '#84cc16', '#f97316'];

                          return (
                            <g key={spec}>
                              <line
                                x1={x}
                                y1={110}
                                x2={x}
                                y2={110 - height}
                                stroke={colors[index % colors.length]}
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="animate-pulse"
                                style={{ animationDelay: `${index * 100}ms` }}
                              />
                              <circle
                                cx={x}
                                cy={110 - height}
                                r="3"
                                fill={colors[index % colors.length]}
                                className="animate-bounce"
                                style={{ animationDelay: `${index * 100}ms` }}
                              />
                              <text
                                x={x}
                                y={120}
                                textAnchor="middle"
                                className="fill-slate-600 text-[8px]"
                              >
                                {spec.length > 6 ? spec.substring(0, 6) + '...' : spec}
                              </text>
                            </g>
                          );
                        })}

                      {/* Trend line */}
                      <path
                        d={`M ${Object.entries(stats.specialty_breakdown)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 8)
                          .map(([, count], index) => {
                            const x = 20 + (index * 20);
                            const y = 110 - (count / maxSpecialtyCount) * 90;
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                          })
                          .join(' ')}`}
                        stroke="#6366f1"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                        strokeDasharray="4,4"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-white px-2 py-1 rounded">
                    Specialty Distribution
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: alerts + upload */}
        <div className="space-y-4 md:space-y-6">
          {/* Critical Alerts */}
          {critical.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                <h3 className="font-semibold text-red-800 text-sm md:text-base">High-Allergy Patients</h3>
              </div>
              <div className="space-y-2">
                {critical.slice(0, 4).map((p) => (
                  <Link key={p.id} href={`/patients/${p.id}`}
                    className="flex items-center justify-between hover:bg-red-100 rounded-lg px-3 md:px-2 py-2.5 md:py-1.5 transition-colors touch-target">
                    <span className="text-sm md:text-base font-medium text-red-900 truncate">{p.name}</span>
                    <span className="text-xs md:text-sm bg-red-200 text-red-700 px-2 py-1 md:py-0.5 rounded-full flex-shrink-0">
                      {p.allergy_count} allergies
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Upload */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Upload className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800 text-sm md:text-base">Quick Upload</h3>
            </div>
            <FileUpload compact />
          </div>

          {/* Drug Checker shortcut */}
          <Link href="/drug-checker"
            className="flex items-center gap-3 md:gap-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl md:rounded-2xl p-4 md:p-5 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm touch-target">
            <div className="w-11 h-11 md:w-10 md:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm md:text-base">Drug Interaction</p>
              <p className="text-blue-200 text-xs md:text-sm">Safety checker tool</p>
            </div>
          </Link>

          {/* Emergency shortcut */}
          <Link href="/emergency"
            className="flex items-center gap-3 md:gap-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl md:rounded-2xl p-4 md:p-5 text-white hover:from-red-700 hover:to-red-800 transition-all shadow-sm touch-target">
            <div className="w-11 h-11 md:w-10 md:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm md:text-base">Stroke Assessment</p>
              <p className="text-red-200 text-xs md:text-sm">BEFAST emergency tool</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
