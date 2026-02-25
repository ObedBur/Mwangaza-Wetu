"use client";

import { useState } from "react";
import WithdrawalRow from "@/components/retraits/WithdrawalRow";
import { useRetraits } from "@/hooks/useRetraits";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import Pagination from "@/components/ui/Pagination";
import { AlertCircle, RefreshCw } from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;

export default function RetraitsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useRetraits({ page, pageSize });

  const transactionsList = response?.data ?? [];
  const meta = response?.meta;

  if (isLoading) return <TableSkeleton rowCount={pageSize} />;

  const pageNumbers = Array.from(
    { length: meta?.totalPages ?? 0 },
    (_, i) => i + 1,
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Historique des Transactions
          <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {new Intl.NumberFormat("fr-FR").format(meta?.total ?? 0)} total
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
              <option>Tous les statuts</option>
              <option>Complété</option>
              <option>En attente</option>
              <option>Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Numéro de Compte
              </th>
              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Membre
              </th>
              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Montant Retiré
              </th>
              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Motif
              </th>
              <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactionsList.length === 0 ? (
              <tr>
                <td className="px-6 py-10" colSpan={6}>
                  <div className="text-sm text-slate-500 text-center">
                    Aucune transaction pour le moment.
                  </div>
                </td>
              </tr>
            ) : (
              transactionsList.map((tx) => (
                <WithdrawalRow key={tx.id} tx={tx} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination dynamique */}
      <Pagination
        currentPage={page}
        totalPages={meta?.totalPages ?? 0}
        totalItems={meta?.total ?? 0}
        firstItemIndex={(page - 1) * pageSize + 1}
        lastItemIndex={Math.min(page * pageSize, meta?.total ?? 0)}
        hasPrev={meta?.hasPrevPage ?? false}
        hasNext={meta?.hasNextPage ?? false}
        pageNumbers={pageNumbers}
        prevPage={() => setPage((p) => Math.max(1, p - 1))}
        nextPage={() => setPage((p) => Math.min(meta?.totalPages ?? p, p + 1))}
        setPage={setPage}
        label="retraits"
      />
    </div>
  );
}
