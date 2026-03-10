"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  Trash2,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
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
  info:    { icon: Info,         color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10",    ring: "ring-blue-200 dark:ring-blue-500/20",    label: "Info" },
  success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-200 dark:ring-emerald-500/20", label: "Succès" },
  warning: { icon: AlertTriangle,color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10",  ring: "ring-amber-200 dark:ring-amber-500/20",  label: "Alerte" },
  credit:  { icon: TrendingUp,   color: "text-purple-500",  bg: "bg-purple-50 dark:bg-purple-500/10",ring: "ring-purple-200 dark:ring-purple-500/20", label: "Crédit" },
  epargne: { icon: PiggyBank,    color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-500/10",ring: "ring-indigo-200 dark:ring-indigo-500/20", label: "Épargne" },
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
          : "border-indigo-100 dark:border-indigo-500/20 bg-white dark:bg-[#0F172A] shadow-sm shadow-indigo-50 dark:shadow-indigo-900/10"
        }`}
    >
      {/* Barre de couleur non-lue */}
      {!notif.isRead && (
        <span className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full" />
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
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
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

export default function NotificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id);
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>("all");

  const membreId = user?.id ? parseInt(user.id) : undefined;

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
    isMarkingAll,
  } = useNotifications(membreId);

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.type === filter);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/portal/${encodeURIComponent(identifier)}`}
            className="w-9 h-9 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-black rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} au total
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {ALL_TYPES.map((type) => {
          const count = type === "all"
            ? notifications.length
            : notifications.filter((n) => n.type === type).length;
          if (type !== "all" && count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize
                ${filter === type
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/5 hover:border-indigo-200 hover:text-indigo-600"
                }`}
            >
              {type === "all" ? "Toutes" : (typeConfig[type]?.label ?? type)} ({count})
            </button>
          );
        })}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-slate-400 dark:text-slate-500">
          <Bell className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">
            {filter === "all" ? "Aucune notification" : `Aucune notification de type « ${typeConfig[filter]?.label} »`}
          </p>
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
