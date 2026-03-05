"use client";

import { useState } from "react";
import { useBalances } from "@/hooks/useBalances";
import Pagination from "@/components/ui/Pagination";
import {
  Search,
  Filter,
  Wallet,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BalanceRow from "@/components/balance/BalanceRow";

const DEFAULT_PAGE_SIZE = 10;

export default function BalanceTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useBalances({
    page,
    pageSize,
  });

  const accountsList = response?.data ?? [];
  const meta = response?.meta;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-20 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse uppercase text-xs tracking-widest font-black">
          Chargement des comptes...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-red-100 dark:border-red-900/30 p-16 flex flex-col items-center justify-center text-center text-sm">
        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          Erreur de chargement
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6 font-bold text-xs uppercase tracking-tighter">
          {error instanceof Error
            ? error.message
            : "Impossible de récupérer les comptes pour le moment."}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-primary/20"
        >
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
        <div className="relative w-full lg:w-[450px] group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm dark:text-slate-200 transition-all shadow-inner font-bold"
            placeholder="Rechercher par nom, ID ou référence..."
            type="text"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl font-black text-[10px] uppercase tracking-widest h-12 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Type de Compte" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl font-bold text-xs uppercase tracking-tight">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="epargne">Épargne</SelectItem>
              <SelectItem value="credit">Crédit</SelectItem>
              <SelectItem value="remboursement">Remboursement</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[150px] rounded-xl font-black text-[10px] uppercase tracking-widest h-12 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Statut" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl font-bold text-xs uppercase tracking-tight">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="frozen">Gelé</SelectItem>
              <SelectItem value="closed">Clôturé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden flex flex-col min-h-[400px] transition-all">
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30">
              <tr>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Réf. Compte
                </th>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Membre
                </th>
                <th
                  className="px-6 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Type
                </th>
                <th
                  className="px-6 py-4 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Statut
                </th>
                <th
                  className="px-6 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Solde Actuel
                </th>
                <th
                  className="px-6 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Flux Entrant
                </th>
                <th
                  className="px-6 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]"
                  scope="col"
                >
                  Flux Sortant
                </th>
                <th className="relative px-6 py-4" scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {accountsList.length === 0 ? (
                <tr>
                  <td className="px-6 py-10" colSpan={8}>
                    <div className="text-sm text-slate-500 text-center">
                      Aucun compte enregistré.
                    </div>
                  </td>
                </tr>
              ) : (
                accountsList.map((account) => (
                  <BalanceRow key={account.id} account={account} />
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
