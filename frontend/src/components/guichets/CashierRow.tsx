"use client";

import { MoreVertical, Lock, Unlock, CheckCircle } from "lucide-react";
import { Cashier, CashierStatus, ShiftStatus } from "@/types";

interface CashierRowProps {
  cashier: Cashier;
}

const statusStyles: Record<CashierStatus, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<CashierStatus, string> = {
  active: "Actif",
  inactive: "Inactif",
  suspended: "Suspendu",
};

const shiftStatusStyles: Record<
  ShiftStatus,
  { icon: typeof Lock; class: string; label: string }
> = {
  open: {
    icon: Unlock,
    class:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    label: "Ouvert",
  },
  closed: {
    icon: Lock,
    class: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    label: "Fermé",
  },
  balanced: {
    icon: CheckCircle,
    class: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    label: "Équilibré",
  },
};

export default function CashierRow({ cashier }: CashierRowProps) {
  const shiftStyle = shiftStatusStyles[cashier.shiftStatus];
  const ShiftIcon = shiftStyle.icon;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
        #{cashier.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
            {cashier.initials}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {cashier.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        {cashier.assignedWindow}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
        <div>{cashier.email}</div>
        <div className="text-xs">{cashier.phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[cashier.status]}`}
        >
          {statusLabels[cashier.status]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${shiftStyle.class}`}
        >
          <ShiftIcon className="w-3 h-3" />
          {shiftStyle.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900 dark:text-white">
        {cashier.balance > 0
          ? `$${cashier.balance.toLocaleString("fr-FR")}`
          : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">
        {cashier.todayTransactions > 0
          ? cashier.todayTransactions.toString()
          : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          type="button"
          className="text-slate-400 hover:text-primary transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}
