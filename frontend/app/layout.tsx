import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { MobileSidebar } from "@/components/MobileSidebar";
import { MobileNavigationProvider } from "@/contexts/MobileNavigationContext";
import { BrowserCompatibilityProvider } from "@/components/BrowserCompatibilityProvider";

export const metadata: Metadata = {
  title: "ClinIQ — Clinical Intelligence Assistant",
  description: "AI-powered clinical assistant that extracts and answers questions from patient medical records",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-slate-50">
        <BrowserCompatibilityProvider>
          <MobileNavigationProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Desktop Sidebar - hidden on mobile */}
              <Sidebar />

              {/* Mobile Navigation - shown only on mobile */}
              <MobileNav />
              <MobileSidebar />

              {/* Main Content - responsive margin */}
              <main className="flex-1 lg:ml-64 overflow-y-auto min-h-screen">
                {children}
              </main>
            </div>
          </MobileNavigationProvider>
        </BrowserCompatibilityProvider>
      </body>
    </html>
  );
}
