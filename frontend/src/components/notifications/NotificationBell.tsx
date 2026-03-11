"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  X,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { Notification } from "@/services/notifications.service";

interface NotificationBellProps {
  membreId?: number;
  membreNumero?: string;
  adminId?: number;
}

/** Formate une date en "il y a X" (sans dépendance externe) */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHr < 24) return `Il y a ${diffHr} h`;
  if (diffDay < 7) return `Il y a ${diffDay} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Icône et couleur selon le type de notification */
const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; ring: string }> = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    ring: "ring-blue-200 dark:ring-blue-500/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    ring: "ring-emerald-200 dark:ring-emerald-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    ring: "ring-amber-200 dark:ring-amber-500/20",
  },
  credit: {
    icon: TrendingUp,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    ring: "ring-purple-200 dark:ring-purple-500/20",
  },
  epargne: {
    icon: PiggyBank,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    ring: "ring-indigo-200 dark:ring-indigo-500/20",
  },
};

function NotificationItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const cfg = typeConfig[notif.type] ?? typeConfig.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`group relative flex gap-3 p-3 rounded-xl transition-all cursor-pointer
        ${notif.isRead ? "opacity-60" : ""}
        hover:bg-slate-50 dark:hover:bg-white/5`}
      onClick={() => !notif.isRead && onRead(notif.id)}
    >
      {/* Indicateur non-lu */}
      {!notif.isRead && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}

      {/* Icône type */}
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${cfg.bg} ${cfg.ring}`}
      >
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 pl-1">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {notif.titre}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
          {notif.message}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {timeAgo(notif.createdAt)}
        </p>
      </div>

      {/* Bouton supprimer */}
      <button
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notif.id);
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function NotificationBell({
  membreId,
  membreNumero,
  adminId,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Utiliser le hook approprié en fonction du contexte (membre ou admin)
  const memberContext = useNotifications(adminId ? undefined : membreId);
  const adminContext = useAdminNotifications(adminId);

  // Consolider les données selon le contexte actif
  const context = adminId ? adminContext : memberContext;

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = context;

  // "isMarkingAll" n'est disponible que dans useNotifications, on utilise un fallback
  const isMarkingAll = !adminId && 'isMarkingAll' in context ? (context as any).isMarkingAll : false;

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const recent = notifications.slice(0, 5);

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`w-10 h-10 rounded-2xl bg-white dark:bg-[#0F172A] border flex items-center justify-center transition-all shadow-sm relative
          ${open
            ? "border-indigo-400 text-indigo-600 shadow-indigo-200 dark:shadow-indigo-500/10"
            : "border-slate-100 dark:border-white/5 text-[#64748B] hover:text-indigo-600"
          }`}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-indigo-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0F172A] shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 w-80 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/5 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40 z-50 overflow-hidden"
          style={{ animation: "fadeSlideDown 0.18s ease" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all disabled:opacity-40"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-[280px] overflow-y-auto py-1.5 px-2 custom-scrollbar">
            {recent.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                <Bell className="w-8 h-8 opacity-25" />
                <p className="text-xs font-medium">Aucune notification</p>
              </div>
            ) : (
              recent.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notif={notif}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>

          {/* Footer - Lien vers la page dédiée */}
          {notifications.length > 0 && (membreNumero || adminId) && (
            <div className="border-t border-slate-100 dark:border-white/5 p-2.5">
              <Link
                href={adminId ? `/dashboard/notifications` : `/portal/${encodeURIComponent(membreNumero!)}/notifications`}
                onClick={() => setOpen(false)}
                className="block w-full text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
              >
                Voir toutes ({notifications.length})
              </Link>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
