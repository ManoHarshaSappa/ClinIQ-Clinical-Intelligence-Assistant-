"use client";

import { useEffect } from 'react';
import { initBrowserFixes } from '@/lib/browser-fixes';

export function BrowserCompatibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize browser compatibility fixes on app startup
    initBrowserFixes();
  }, []);

  return <>{children}</>;
}