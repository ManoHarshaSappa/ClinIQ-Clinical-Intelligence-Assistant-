import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SPECIALTY_COLORS: Record<string, string> = {
  cardiology: "red",
  oncology: "violet",
  neurology: "blue",
  endocrinology: "amber",
  pulmonology: "cyan",
  obstetrics: "pink",
  orthopedics: "emerald",
  psychiatry: "indigo",
  nephrology: "orange",
  gastroenterology: "lime",
  bariatrics: "teal",
  "allergy / immunology": "sky",
};

export function getSpecialtyColor(specialty: string | null | undefined): string {
  if (!specialty) return "slate";
  return SPECIALTY_COLORS[specialty.toLowerCase()] ?? "slate";
}

export function getSpecialtyBg(specialty: string | null | undefined): string {
  const color = getSpecialtyColor(specialty);
  const map: Record<string, string> = {
    red: "bg-red-100 text-red-700 border-red-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    lime: "bg-lime-100 text-lime-700 border-lime-200",
    teal: "bg-teal-100 text-teal-700 border-teal-200",
    sky: "bg-sky-100 text-sky-700 border-sky-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return map[color] ?? map.slate;
}

export function getSpecialtyBorder(specialty: string | null | undefined): string {
  const color = getSpecialtyColor(specialty);
  const map: Record<string, string> = {
    red: "border-l-red-500",
    violet: "border-l-violet-500",
    blue: "border-l-blue-500",
    amber: "border-l-amber-500",
    cyan: "border-l-cyan-500",
    pink: "border-l-pink-500",
    emerald: "border-l-emerald-500",
    indigo: "border-l-indigo-500",
    orange: "border-l-orange-500",
    lime: "border-l-lime-500",
    teal: "border-l-teal-500",
    sky: "border-l-sky-500",
    slate: "border-l-slate-400",
  };
  return map[color] ?? map.slate;
}
