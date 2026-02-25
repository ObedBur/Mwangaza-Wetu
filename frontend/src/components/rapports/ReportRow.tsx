"use client";

import { MoreVertical, Download, FileText } from "lucide-react";
import { Report, ReportStatus } from "@/types";

interface ReportRowProps {
  report: Report;
}

const statusStyles: Record<ReportStatus, string> = {
  draft: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusLabels: Record<ReportStatus, string> = {
  draft: "Brouillon",
  pending: "En attente",
  approved: "Approuvé",
  archived: "Archivé",
};

const typeLabels: Record<string, string> = {
  financial: "Financier",
  audit: "Audit",
  operational: "Opérationnel",
  compliance: "Conformité",
  monthly: "Mensuel",
  annual: "Annuel",
};

export default function ReportRow({ report }: ReportRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
        #{report.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="font-medium">{report.title}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
          {typeLabels[report.type] || report.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
            {report.authorInitials}
          </div>
          <div className="text-sm text-slate-900 dark:text-slate-200">
            {report.author}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {formatDate(report.createdDate)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {report.period}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[report.status]}`}
        >
          {statusLabels[report.status]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">
        {report.size}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="text-slate-400 hover:text-primary transition-colors p-1"
            title={`${report.downloads} téléchargements`}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-primary transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
