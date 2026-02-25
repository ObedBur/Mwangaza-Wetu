"use client";

import { Pencil, Trash2 } from "lucide-react";
import { WithdrawalTransaction } from "@/types";

export default function WithdrawalRow({ tx }: { tx: WithdrawalTransaction }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {formatDate(tx.dateISO)}
        </div>
        <div className="text-xs text-slate-400">{tx.time}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <span className="font-mono text-sm font-bold text-primary">
          {tx.accountNumber}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {initials(tx.memberName)}
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            {tx.memberName}
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-bold text-slate-900 dark:text-white">
          {formatAmount(tx.amount)} {tx.currency}
        </div>
        {typeof tx.amountUSD === "number" && (
          <div className="text-xs text-slate-400">
            ${formatAmount(tx.amountUSD)}
          </div>
        )}
      </td>
      <td className="px-4 sm:px-6 py-4">
        <p className="text-sm text-slate-500 truncate max-w-[150px]">
          {tx.reason}
        </p>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-primary transition-colors"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
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
