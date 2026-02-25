"use client";

import { useState } from "react";
import CreditRow from "@/components/credits/CreditRow";
import { useCredits } from "@/hooks/useCredits";
import Pagination from "@/components/ui/Pagination";
import { Loader2, AlertCircle, RefreshCw, Search, Filter } from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;

export default function CreditsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useCredits({
    page,
    pageSize,
  });

  const creditsList = response?.data ?? [];
  const meta = response?.meta;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Chargement des crédits...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm p-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">
          {error instanceof Error
            ? error.message
            : "Impossible de récupérer les crédits pour le moment."}
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

  const pageNumbers = Array.from(
    { length: meta?.totalPages ?? 0 },
    (_, i) => i + 1,
  );

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center text-sm">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            className="block w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Rechercher par nom, ID ou montant..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <select className="appearance-none block w-full pl-4 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option>Tous les status</option>
              <option>En cours</option>
              <option>Terminé</option>
              <option>En retard</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full flex-1">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4" scope="col">
                ID Dossier
              </th>
              <th className="px-6 py-4" scope="col">
                Client
              </th>
              <th className="px-6 py-4" scope="col">
                Montant
              </th>
              <th className="px-6 py-4" scope="col">
                Date Début
              </th>
              <th className="px-6 py-4" scope="col">
                Taux
              </th>
              <th className="px-6 py-4" scope="col">
                Status
              </th>
              <th className="px-6 py-4 text-right" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-slate-600 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
            {creditsList.length === 0 ? (
              <tr>
                <td className="px-6 py-12" colSpan={7}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-slate-500">
                      Aucun crédit pour le moment.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              creditsList.map((credit) => (
                <CreditRow key={credit.id} credit={credit} />
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
        label="crédits"
      />
    </section>
  );
}
