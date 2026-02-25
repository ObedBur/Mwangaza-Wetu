import React from "react";

interface TableSkeletonProps {
  rowCount?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rowCount = 5,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden w-full">
      {/* Header (Membres récents + filtres) */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          {/* En-têtes de colonnes */}
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ml-auto"></div>
              </th>
            </tr>
          </thead>

          {/* Lignes du tableau simulées */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: rowCount }).map((_, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 sm:px-6 py-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="h-6 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-pulse"></div>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse inline-block"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer (Pagination) */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
