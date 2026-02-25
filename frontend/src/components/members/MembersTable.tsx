"use client";

import { useState } from "react";
import MemberTableRow from "./MemberTableRow";
import { useMembers } from "@/hooks/useMembers";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import Pagination from "@/components/ui/Pagination";
import {
  Filter,
  Download,
  Users,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DEFAULT_PAGE_SIZE = 10;

interface MembersTableProps {
  onActionClick: (memberId: number) => void;
}

export default function MembersTable({ onActionClick }: MembersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useMembers({
    page,
    pageSize,
  });

  const membersList = response?.data ?? [];
  const meta = response?.meta;

  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 p-16 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6">
          {error instanceof Error
            ? error.message
            : "Impossible de récupérer les membres pour le moment."}
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
          Membres récents
          <span className="text-[10px] font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
            {new Intl.NumberFormat("fr-FR").format(meta?.total ?? 0)} total
          </span>
        </h4>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg active:scale-95">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg active:scale-95">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avatar
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                N° Compte
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nom Complet
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Téléphone
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Type Compte
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {membersList.length > 0 ? (
              membersList.map((member) => (
                <MemberTableRow
                  key={member.id}
                  member={member}
                  onActionClick={onActionClick}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 sm:px-6 py-12 sm:py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <Users className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-300">
                        Aucun membre trouvé
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                        Commencez par ajouter un nouveau membre à votre
                        coopérative
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
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
        label="membres"
      />
    </div>
  );
}
