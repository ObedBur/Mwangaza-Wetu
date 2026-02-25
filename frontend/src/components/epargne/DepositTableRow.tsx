"use client";

import { Pencil, Trash2 } from "lucide-react";
import { DepositTransaction } from "@/types";

export default function DepositTableRow({ tx }: { tx: DepositTransaction }) {
  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {initials(tx.memberName)}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">
              {tx.memberName}
            </div>
            <div className="text-xs text-slate-500">#{tx.accountNumber}</div>
          </div>
        </div>
      </td>

      <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 dark:text-white">
        {formatAmount(tx.amount)}
      </td>

      <td className="px-4 sm:px-6 py-4 text-center">
        <span
          className={
            tx.currency === "FC"
              ? "px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-[10px] font-bold"
              : "px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold"
          }
        >
          {tx.currency}
        </span>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm text-slate-600 dark:text-slate-200">
          {formatDate(tx.dateISO)}
        </div>
        <div className="text-[10px] text-slate-400 italic">{tx.time}</div>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {formatAmount(tx.runningTotal.amount)} {tx.runningTotal.currency}
        </div>
        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
          +{tx.runningTotal.changePct}%
        </div>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 rounded transition-colors text-slate-500"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
