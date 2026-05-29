import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ClinIQ — Clinical Intelligence Assistant",
  description: "AI-powered clinical assistant that extracts and answers questions from patient medical records",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          {/* offset for fixed sidebar */}
          <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
