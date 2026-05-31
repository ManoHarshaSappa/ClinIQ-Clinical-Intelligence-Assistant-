"use client";

import { Menu, X, Stethoscope, ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const { isSidebarOpen, isMobile, toggleSidebar } = useMobileNavigation();
  const router = useRouter();
  const pathname = usePathname();

  // Only render on mobile screens
  if (!isMobile) {
    return null;
  }

  const isHomePage = pathname === "/";

  const handleBack = () => {
    // Try to go back in history, fallback to home if no history
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const getPageTitle = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    const page = segments[0] || 'Dashboard';

    const titles: Record<string, string> = {
      'patients': 'Patients',
      'search': 'Search',
      'drug-checker': 'Drug Checker',
      'emergency': 'Emergency',
      'upload': 'Upload',
      'about': 'About',
    };

    return titles[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  return (
    <div className={cn("lg:hidden", className)}>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-[#1E293B] z-40 flex items-center px-4">
        {/* Back Button or Hamburger Menu */}
        {!isHomePage ? (
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-all duration-150"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-all duration-150"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Mobile Logo and Page Title */}
        <div className="flex items-center gap-3 ml-4 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-base leading-none">
              {isHomePage ? "ClinIQ" : getPageTitle(pathname)}
            </p>
            <p className="text-slate-400 text-xs mt-0.5 truncate">
              {isHomePage ? "Clinical Intelligence" : "Clinical Intelligence Assistant"}
            </p>
          </div>
        </div>

        {/* Menu Button for non-home pages */}
        {!isHomePage && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-all duration-150 ml-2"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </div>
  );
}