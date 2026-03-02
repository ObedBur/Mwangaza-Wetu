"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DepositTransaction } from "@/types";
import { ACCOUNT_TYPES } from "@/lib/constants";

export default function DepositTableRow({ tx }: { tx: DepositTransaction }) {
  const [imageError, setImageError] = useState(false);

  /** Génère l'URL de la photo de profil */
  const getPhotoUrl = (photo: string) => {
    if (photo.startsWith('data:')) return photo;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/api$/, '');
    return `${baseUrl}/uploads/${photo}?t=${Date.now()}`;
  };

  return (
    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0 bg-primary/10 flex items-center justify-center">
            {tx.membre?.photoProfil && !imageError ? (
              <img
                src={getPhotoUrl(tx.membre.photoProfil)}
                alt={tx.membre.nomComplet}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-primary font-bold text-sm">
                {initials(tx.membre?.nomComplet || "??")}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              {tx.membre?.nomComplet || "Membre Inconnu"}
              {tx.membre?.typeCompte && (
                <span className="text-[9px] font-bold bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/10">
                  {ACCOUNT_TYPES.find((t) => t.value === tx.membre?.typeCompte)
                    ?.label || tx.membre.typeCompte}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">#{tx.compte}</div>
          </div>
        </div>
      </td>

      <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 dark:text-white">
        {formatAmount(tx.montant)}
      </td>

      <td className="px-4 sm:px-6 py-4 text-center">
        <span
          className={
            tx.devise === "FC"
              ? "px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-[10px] font-bold"
              : "px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-[10px] font-bold"
          }
        >
          {tx.devise}
        </span>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm text-slate-600 dark:text-slate-200">
          {formatDate(tx.dateOperation)}
        </div>
        <div className="text-[10px] text-slate-400 italic">
          {new Date(tx.dateOperation).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <div className="text-xs text-slate-500 truncate max-w-[150px]">
          {tx.description || "-"}
        </div>
      </td>

      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
            aria-label="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 rounded transition-colors text-slate-500"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
