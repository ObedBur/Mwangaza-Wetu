"use client";

import {
  MoreVertical,
  PiggyBank,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Ban,
} from "lucide-react";
import { AccountBalance, BalanceType, BalanceStatus } from "@/types";

interface BalanceRowProps {
  account: AccountBalance;
}

const typeIcons: Record<BalanceType, typeof PiggyBank> = {
  epargne: PiggyBank,
  credit: CreditCard,
  retrait: ArrowDownCircle,
  remboursement: ArrowUpCircle,
  interet: Wallet,
};

const typeLabels: Record<BalanceType, string> = {
  epargne: "Épargne",
  credit: "Crédit",
  retrait: "Retrait",
  remboursement: "Remboursement",
  interet: "Intérêts",
};

const statusStyles: Record<BalanceStatus, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
  frozen: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<BalanceStatus, string> = {
  active: "Actif",
  closed: "Clôturé",
  frozen: "Gelé",
};

export default function BalanceRow({ account }: BalanceRowProps) {
  const TypeIcon = typeIcons[account.accountType];
  const displayBalance =
    account.currency === "USD"
      ? `$${account.balanceUSD.toLocaleString("fr-FR")}`
      : `${account.balanceFC.toLocaleString("fr-FR")} FC`;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
        #{account.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
            {account.initials}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {account.memberName}
            </div>
            <div className="text-xs text-slate-500">{account.memberId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800">
            <TypeIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {typeLabels[account.accountType]}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[account.status]}`}
        >
          {account.status === "frozen" && <Ban className="w-3 h-3 mr-1" />}
          {statusLabels[account.status]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white text-right">
        {displayBalance}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-right">
        ${account.totalDeposits.toLocaleString("fr-FR")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 text-right">
        ${account.totalWithdrawals.toLocaleString("fr-FR")}
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
