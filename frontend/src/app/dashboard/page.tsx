"use client";

import StatsSection from "@/components/dashboard/StatsSection";
import QuickLinksSection from "@/components/dashboard/QuickLinksSection";
import AdminSection from "@/components/dashboard/AdminSection";

/**
 * Page d'accueil du tableau de bord.
 * Le Header, le Footer et la Sidebar sont gérés par le layout parent.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <StatsSection />
      <QuickLinksSection />
      <AdminSection />
    </div>
  );
}
