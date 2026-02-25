import type { Metadata } from "next";
import Header from "@/components/dashboard/Header";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import Sidebar from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard - Mwangaza Wetu",
  description:
    "Espace Administrateur - Gestion de la coopérative Mwangaza Wetu",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-hidden">
      {/* Navigation latérale persistante */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Entête persistante */}
        <Header />

        {/* Zone de contenu principale avec scroll indépendant */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>

          {/* Pied de page en bas du contenu */}
          <div className="mt-auto">
            <DashboardFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
