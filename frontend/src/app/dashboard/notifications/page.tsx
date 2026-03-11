"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useAuth } from "@/providers/AuthProvider";
import { Notification } from "@/services/notifications.service";

/** Formate une date en "il y a X" */
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
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; ring: string; label: string }> = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", ring: "ring-blue-200 dark:ring-blue-500/20", label: "Info" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-200 dark:ring-emerald-500/20", label: "Succès" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", ring: "ring-amber-200 dark:ring-amber-500/20", label: "Alerte" },
  credit: { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", ring: "ring-purple-200 dark:ring-purple-500/20", label: "Crédit" },
  epargne: { icon: PiggyBank, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", ring: "ring-indigo-200 dark:ring-indigo-500/20", label: "Épargne" },
};

const ALL_TYPES = ["all", "info", "success", "warning", "credit", "epargne"] as const;
type FilterType = (typeof ALL_TYPES)[number];

function NotificationCard({
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
      className={`group relative flex gap-4 p-4 rounded-2xl border transition-all
        ${notif.isRead
          ? "border-slate-100 dark:border-white/5 bg-white dark:bg-[#0F172A] opacity-60"
          : "border-primary/20 bg-white dark:bg-[#0F172A] shadow-sm shadow-primary/5"
        }`}
    >
      {/* Barre de couleur non-lue */}
      {!notif.isRead && (
        <span className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full" />
      )}

      {/* Icône */}
      <div className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ring-1 ${cfg.bg} ${cfg.ring} ml-2`}>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{notif.titre}</h3>
          </div>
          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {timeAgo(notif.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.isRead && (
          <button
            onClick={() => onRead(notif.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
            title="Marquer comme lue"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const adminId = user?.id ? parseInt(user.id) : undefined;

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
    isMarkingAll,
  } = useAdminNotifications(adminId);

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Centre de Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-primary text-white text-xs font-black rounded-full shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""} au total de l'activité du système.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-[#0F172A] p-2 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="pl-2 pr-1 flex items-center">
          <Filter className="w-4 h-4 text-slate-400" />
        </div>
        {ALL_TYPES.map((type) => {
          const count = type === "all"
            ? notifications.length
            : notifications.filter((n) => n.type === type).length;
          if (type !== "all" && count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize
                ${filter === type
                  ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
            >
              {type === "all" ? "Toutes" : (typeConfig[type]?.label ?? type)}
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${filter === type ? 'bg-white dark:bg-black/20 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="space-y-4 pt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-32 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-100 dark:border-white/5 border-dashed">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {filter === "all" ? "Aucune notification" : `Aucune notification « ${typeConfig[filter]?.label} »`}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Vous êtes à jour dans vos alertes.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              onRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
