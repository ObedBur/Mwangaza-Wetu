"use client";

import { useMemo, useState } from "react";
import RapportsHeader from "@/components/rapports/RapportsHeader";
import RapportsStatsSection from "@/components/rapports/RapportsStatsSection";
import RapportsTable from "@/components/rapports/RapportsTable";
import CreateReportModal from "@/components/rapports/CreateReportModal";
import { Report } from "@/types";

/**
 * Page de rapports et statistiques.
 */
export default function RapportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reports: Report[] = [];

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const approvedCount = reports.filter((r) => r.status === "approved").length;
    const pendingCount = reports.filter((r) => r.status === "pending").length;
    const totalDownloads = reports.reduce((sum, r) => sum + r.downloads, 0);

    return { totalReports, approvedCount, pendingCount, totalDownloads };
  }, [reports]);

  const handleCreateReport = (data: unknown) => {
    console.log("New report:", data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <RapportsHeader onCreateClick={() => setIsModalOpen(true)} />

      <RapportsStatsSection
        totalReports={stats.totalReports}
        approvedCount={stats.approvedCount}
        pendingCount={stats.pendingCount}
        totalDownloads={stats.totalDownloads}
      />

      <RapportsTable reports={reports} />

      <CreateReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateReport}
      />
    </div>
  );
}
