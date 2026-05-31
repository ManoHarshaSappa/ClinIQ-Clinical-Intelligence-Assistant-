"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";
import { cn } from "@/lib/utils";

interface MobileBackButtonProps {
  className?: string;
  fallbackPath?: string;
}

export function MobileBackButton({ className, fallbackPath = "/" }: MobileBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useMobileNavigation();

  // Don't show on home page or desktop
  if (!isMobile || pathname === "/" || pathname === fallbackPath) {
    return null;
  }

  const handleBack = () => {
    // Try to go back in history, fallback to home if no history
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  };

  const getPageTitle = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    const page = segments[0] || 'Home';

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
      <div className="flex items-center gap-3 p-4 bg-white border-b border-slate-200">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all touch-target"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-slate-900 text-base">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>
    </div>
  );
}