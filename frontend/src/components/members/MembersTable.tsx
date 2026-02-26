"use client";

import { useState } from "react";
import MemberTableRow from "./MemberTableRow";
import { useMembers } from "@/hooks/useMembers";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import Pagination from "@/components/ui/Pagination";
import { MembersEmptyState, ServerErrorState } from "@/components/ui/empty-state";
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
  onCreateMember?: () => void;
}

export default function MembersTable({ onActionClick, onCreateMember }: MembersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isEmpty,
    isServerError,
  } = useMembers({
    page,
    pageSize,
  });

  const membersList = response?.data ?? [];
  const meta = response?.meta;

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  // Erreur serveur (500)
  if (isServerError) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <ServerErrorState 
          onRetry={() => refetch()} 
          isRetrying={isLoading}
        />
      </div>
    );
  }

  // Autres erreurs (404, réseau, etc.) - on affiche l'état vide
  if (isError || isEmpty) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <MembersEmptyState 
          onCreateMember={onCreateMember}
          onRetry={() => refetch()} 
          isRetrying={isLoading}
        />
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
            {membersList.map((member) => (
              <MemberTableRow
                key={member.id}
                member={member}
                onActionClick={onActionClick}
              />
            ))}
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
