"use client";

import { MoreVertical } from "lucide-react";
import { RepaymentRecord, RepaymentStatus } from "@/types";

interface RepaymentRowProps {
  repayment: RepaymentRecord;
}

const statusStyles: Record<RepaymentStatus, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed:
    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<RepaymentStatus, string> = {
  active: "À jour",
  completed: "Clôturé",
  overdue: "En retard",
};

export default function RepaymentRow({ repayment }: RepaymentRowProps) {
  const isOverdue = repayment.status === "overdue";

  return (
    <tr
      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
        isOverdue ? "bg-red-50/30 dark:bg-red-900/10" : ""
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {formatDate(repayment.date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mr-3 ${
              isOverdue
                ? "bg-red-100 text-red-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {repayment.memberInitials}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {repayment.memberName}
            </div>
            <div className="text-xs text-slate-500">{repayment.accountId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 dark:text-slate-200 font-medium">
        {formatAmount(repayment.initialAmount, repayment.currency)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">
        {formatAmount(repayment.interestAmount, repayment.currency)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 dark:text-slate-200 font-bold">
        {formatAmount(repayment.totalDue, repayment.currency)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${
                repayment.status === "completed"
                  ? "bg-green-500"
                  : isOverdue
                    ? "bg-red-500"
                    : "bg-primary"
              }`}
              style={{ width: `${repayment.progressPercent}%` }}
            />
          </div>
          <span
            className={`text-xs font-medium ${
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {repayment.progressPercent}%
          </span>
        </div>
      </td>
      <td
        className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
          isOverdue
            ? "text-red-600 dark:text-red-400"
            : "text-slate-900 dark:text-slate-200"
        }`}
      >
        {formatAmount(repayment.remainingAmount, repayment.currency)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[repayment.status]}`}
        >
          {statusLabels[repayment.status]}
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
