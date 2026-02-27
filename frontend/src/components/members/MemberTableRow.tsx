"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  MoreVertical,
  Eye,
  Edit,
  UserMinus,
  UserCheck
} from "lucide-react";

import { MemberRecord } from "@/types";
import { ACCOUNT_TYPES } from "@/lib/constants";

interface MemberTableRowProps {
  member: MemberRecord;
  onActionClick: (memberId: number) => void;
}

export default function MemberTableRow({
  member,
  onActionClick,
}: MemberTableRowProps) {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusColors: Record<string, string> = {
    actif: "bg-green-100 text-green-700",
    inactif: "bg-red-100 text-red-700",
  };

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  /** Génère l'URL de la photo de profil */
  const getPhotoUrl = (photo: string) => {
    if (photo.startsWith('data:')) return photo;
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/api$/, '');
    // Ajout d'un timestamp pour éviter le cache du navigateur
    return `${baseUrl}/uploads/${photo}?t=${Date.now()}`;
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0 bg-primary/10 flex items-center justify-center">
          {member.photoProfil && !imageError ? (
            <img
              src={getPhotoUrl(member.photoProfil)}
              alt={member.nomComplet}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
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
        <span className="text-[10px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1.5 rounded-lg line-clamp-1 whitespace-nowrap">
          {(() => {
            const type = ACCOUNT_TYPES.find(
              (t) => t.value === member.typeCompte,
            );
            return type ? `${type.prefix} - ${type.label}` : member.typeCompte;
          })()}
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
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 transition-all rounded-lg active:scale-95 ${showMenu ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              {/* Entête Menu */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compte: {member.numeroCompte}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{member.nomComplet}</p>
              </div>

              <div className="p-1.5 space-y-0.5">
                {/* Profil & Edition */}
                <button
                  onClick={() => { onActionClick(member.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                  Voir le Profil
                </button>
                <button
                  onClick={() => { console.log("Edit", member.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                >
                  <Edit className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                  Modifier les Infos
                </button>

                <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => { console.log("Status change", member.id); setShowMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors group ${member.statut === 'actif' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                >
                  {member.statut === 'actif' ? (
                    <>
                      <UserMinus className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                      Désactiver le compte
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-green-400 group-hover:text-green-600" />
                      Activer le compte
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
