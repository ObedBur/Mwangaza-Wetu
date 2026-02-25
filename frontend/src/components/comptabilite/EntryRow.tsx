"use client";

import { MoreVertical, Paperclip } from "lucide-react";
import { AccountingEntry, EntryStatus, EntryType } from "@/types";

interface EntryRowProps {
  entry: AccountingEntry;
}

const statusStyles: Record<EntryStatus, string> = {
  validated:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  reconciled:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusLabels: Record<EntryStatus, string> = {
  validated: "Validé",
  pending: "En attente",
  reconciled: "Rapproché",
};

export default function EntryRow({ entry }: EntryRowProps) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
        #{entry.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {formatDate(entry.date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-200">
        <div className="flex items-center gap-2">
          <span>{entry.description}</span>
          {entry.attachments > 0 && (
            <Paperclip className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium">
          {entry.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">
        {entry.debit > 0 ? formatAmount(entry.debit, entry.currency) : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-400">
        {entry.credit > 0 ? formatAmount(entry.credit, entry.currency) : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[entry.status]}`}
        >
          {statusLabels[entry.status]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          type="button"
          className="text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
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

function formatAmount(amount: number, currency: string) {
  const symbol = currency === "USD" ? "$" : "₣";
  return `${symbol}${new Intl.NumberFormat("fr-FR").format(amount)}`;
}
