"use client";

import { Eye, Pencil } from "lucide-react";
import { CreditRecord, CreditStatus } from "@/types";

interface CreditRowProps {
  credit: CreditRecord;
}

const statusStyles: Record<CreditStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  completed:
    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const statusLabels: Record<CreditStatus, string> = {
  pending: "En attente",
  active: "En cours",
  overdue: "En retard",
  completed: "Terminé",
};

export default function CreditRow({ credit }: CreditRowProps) {
  return (
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50">
      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
        #{credit.id}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
            {credit.initials}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-white">
              {credit.memberName}
            </span>
            <span className="text-xs text-slate-400">{credit.memberRole}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
        {new Intl.NumberFormat("fr-FR").format(credit.amount)} {credit.currency}
      </td>
      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
        {formatDate(credit.startDate)}
      </td>
      <td className="px-6 py-4">{credit.interestRate}%</td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[credit.status]}`}
        >
          {statusLabels[credit.status]}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
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
