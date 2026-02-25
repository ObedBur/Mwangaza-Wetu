"use client";

import { useState } from "react";
import DepositTableRow from "@/components/epargne/DepositTableRow";
import { useSavings } from "@/hooks/useSavings";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import Pagination from "@/components/ui/Pagination";
import { AlertCircle, RefreshCw } from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;

export default function DepositsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useSavings({ page, pageSize });

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
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Historique des transactions
          <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {new Intl.NumberFormat("fr-FR").format(meta?.total ?? 0)} total
          </span>
        </h2>
        <span className="text-xs text-slate-500">
          Dernière mise à jour: à l&apos;instant
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-4 sm:px-6 py-4">Membre</th>
              <th className="px-4 sm:px-6 py-4">Montant</th>
              <th className="px-4 sm:px-6 py-4 text-center">Devise</th>
              <th className="px-4 sm:px-6 py-4">Date</th>
              <th className="px-4 sm:px-6 py-4">Cumul FC/USD</th>
              <th className="px-4 sm:px-6 py-4">Actions</th>
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
              transactionsList.map((t) => <DepositTableRow key={t.id} tx={t} />)
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
        label="transactions"
      />
    </div>
  );
}
