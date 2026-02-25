"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  firstItemIndex: number;
  lastItemIndex: number;
  hasPrev: boolean;
  hasNext: boolean;
  pageNumbers: number[];
  prevPage: () => void;
  nextPage: () => void;
  setPage: (page: number) => void;
  label?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  firstItemIndex,
  lastItemIndex,
  hasPrev,
  hasNext,
  pageNumbers,
  prevPage,
  nextPage,
  setPage,
  label = "entrées",
}: PaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
      <p className="text-xs sm:text-sm text-slate-500">
        Affichage de{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {firstItemIndex}–{lastItemIndex}
        </span>{" "}
        sur{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {new Intl.NumberFormat("fr-FR").format(totalItems)}
        </span>{" "}
        {label}
      </p>

      <div className="flex items-center gap-1.5">
        {/* Précédent */}
        <button
          type="button"
          onClick={prevPage}
          disabled={!hasPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numéros de pages */}
        {pageNumbers.map((page, idx) => {
          const prev = pageNumbers[idx - 1];
          const showEllipsis = prev !== undefined && page - prev > 1;
          return (
            <span key={page} className="flex items-center gap-1.5">
              {showEllipsis && (
                <span className="text-xs text-slate-400 px-1">…</span>
              )}
              <button
                type="button"
                onClick={() => setPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors active:scale-95 ${
                  page === currentPage
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            </span>
          );
        })}

        {/* Suivant */}
        <button
          type="button"
          onClick={nextPage}
          disabled={!hasNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
