import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Portail Membre - Mwangaza Wetu",
  description: "Espace membre pour la coopérative Mwangaza Wetu",
};

import MemberSidebar from "@/components/portal/MemberSidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/20">
      {/* Barre latérale membre */}
      <MemberSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Navbar />

        <main className="flex-1 overflow-y-auto custom-scrollbar pt-24 pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
