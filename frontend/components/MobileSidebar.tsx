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
  X,
} from "lucide-react";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";
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

interface MobileSidebarProps {
  className?: string;
}

export function MobileSidebar({ className }: MobileSidebarProps) {
  const pathname = usePathname();
  const { isSidebarOpen, isMobile, closeSidebar } = useMobileNavigation();

  // Only render on mobile and when sidebar is open
  if (!isMobile || !isSidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-80 bg-[#0F172A] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">ClinIQ</p>
              <p className="text-slate-400 text-xs mt-0.5">Clinical Intelligence</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-all duration-150"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? item.danger
                      ? "bg-red-600/20 text-red-400 border border-red-600/30"
                      : "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : item.danger
                    ? "text-red-400/70 hover:text-red-400 hover:bg-red-600/10"
                    : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
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
    </>
  );
}