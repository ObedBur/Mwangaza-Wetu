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
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          #{account.id}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm group-hover:scale-110 transition-transform">
            {account.initials}
          </div>
          <div className="ml-4">
            <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              {account.memberName}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{account.memberId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/5 border border-primary/10">
            <TypeIcon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">
            {typeLabels[account.accountType]}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${statusStyles[account.status]}`}
        >
          {account.status === "frozen" && <Ban className="w-3 h-3 mr-1" />}
          {statusLabels[account.status]}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-sm font-black text-slate-900 dark:text-white">
          {displayBalance}
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Disponible</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
          +${account.totalDeposits.toLocaleString("fr-FR")}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
          -${account.totalWithdrawals.toLocaleString("fr-FR")}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
}
