"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Search,
  AlertTriangle,
  Upload,
  Pill,
  Stethoscope,
  Activity,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",             label: "Dashboard",     icon: LayoutDashboard, exact: true },
  { href: "/patients",     label: "Patients",      icon: Users,           exact: false },
  { href: "/search",       label: "Search",        icon: Search,          exact: false },
  { href: "/drug-checker", label: "Drug Checker",  icon: Pill,            exact: false },
  { href: "/emergency",    label: "Emergency",     icon: AlertTriangle,   exact: false, danger: true },
  { href: "/upload",       label: "Upload",        icon: Upload,          exact: false },
  { href: "/about",        label: "About",         icon: Info,            exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-[#0F172A] flex-col z-50 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">ClinIQ</p>
            <p className="text-slate-400 text-xs mt-0.5">Clinical Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? item.danger
                    ? "bg-red-600/20 text-red-400 border border-red-600/30"
                    : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : item.danger
                  ? "text-red-400/70 hover:text-red-400 hover:bg-red-600/10"
                  : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.danger && !isActive && (
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-slate-500">System Online</span>
          <span className="ml-auto text-xs text-slate-600">v2.0</span>
        </div>
      </div>
    </aside>
  );
}
