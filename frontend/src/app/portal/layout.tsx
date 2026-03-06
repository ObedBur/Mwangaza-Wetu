import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Portail Membre - Mwangaza Wetu",
  description: "Espace membre pour la coopérative Mwangaza Wetu",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark text-slate-900 dark:text-slate-100 flex flex-col selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 overflow-x-hidden pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
