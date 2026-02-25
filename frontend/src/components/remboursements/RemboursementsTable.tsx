"use client";

import { useState } from "react";
import { useRepayments } from "@/hooks/useRepayments";
import Pagination from "@/components/ui/Pagination";
import {
  Search,
  Filter,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import RepaymentRow from "@/components/remboursements/RepaymentRow";

const DEFAULT_PAGE_SIZE = 10;

export default function RemboursementsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepayments({
    page,
    pageSize,
  });

  const repaymentsList = response?.data ?? [];
  const meta = response?.meta;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Chargement des remboursements...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 p-16 flex flex-col items-center justify-center text-center text-sm">
        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">
          {error instanceof Error
            ? error.message
            : "Impossible de récupérer les remboursements pour le moment."}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary/20"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm dark:text-slate-200"
            placeholder="Rechercher par nom, compte ou montant..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Date</span>
          </button>
        </div>
      </div>

      {/* Table & Pagination Wrapper */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Date
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Compte
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Montant Initial
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Intérêt (15%)
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Total Dû
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Progression
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Solde Restant
                </th>
                <th
                  className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Statut
                </th>
                <th className="relative px-6 py-3" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {repaymentsList.length === 0 ? (
                <tr>
                  <td className="px-6 py-10" colSpan={9}>
                    <div className="text-sm text-slate-500 text-center">
                      Aucun remboursement pour le moment.
                    </div>
                  </td>
                </tr>
              ) : (
                repaymentsList.map((repayment) => (
                  <RepaymentRow key={repayment.id} repayment={repayment} />
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
          pageNumbers={Array.from(
            { length: meta?.totalPages ?? 0 },
            (_, i) => i + 1,
          )}
          prevPage={() => setPage((p) => Math.max(1, p - 1))}
          nextPage={() =>
            setPage((p) => Math.min(meta?.totalPages ?? p, p + 1))
          }
          setPage={setPage}
          label="résultats"
        />
      </div>
    </section>
  );
}
