"use client";

import { User } from "lucide-react";
import { MoreVertical } from "lucide-react";

import { MemberRecord } from "@/types";

interface MemberTableRowProps {
  member: MemberRecord;
  onActionClick: (memberId: number) => void;
}

export default function MemberTableRow({
  member,
  onActionClick,
}: MemberTableRowProps) {
  const statusColors: Record<string, string> = {
    actif: "bg-green-100 text-green-700",
    inactif: "bg-red-100 text-red-700",
  };

  const statusDotColor: Record<string, string> = {
    actif: "bg-green-600",
    inactif: "bg-red-600",
  };

  const statusLabel: Record<string, string> = {
    actif: "Actif",
    inactif: "Inactif",
  };

  /** Génère des initiales à partir du nom complet */
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0 bg-primary/10 flex items-center justify-center">
          {member.photoProfil ? (
            <img
              src={member.photoProfil}
              alt={member.nomComplet}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-sm font-bold text-primary">
              {getInitials(member.nomComplet)}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <span className="font-mono text-xs sm:text-sm font-bold text-primary">
          {member.numeroCompte}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <p className="text-sm sm:text-base font-semibold line-clamp-1">
          {member.nomComplet}
        </p>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
          {member.telephone}
        </p>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <span className="text-[10px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-lg line-clamp-1">
          {member.typeCompte}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${statusColors[member.statut] || "bg-slate-100 text-slate-600"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusDotColor[member.statut] || "bg-slate-600"}`}
          ></span>
          {statusLabel[member.statut] || member.statut}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
        <button
          onClick={() => onActionClick(member.id)}
          className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg active:scale-95"
        >
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </td>
    </tr>
  );
}
