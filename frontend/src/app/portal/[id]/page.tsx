"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import MemberDashboardView from "@/components/portal/MemberDashboardView";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";

export default function PortalMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Déballer les params asynchrones
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id);

  const { data: dashboardData, isLoading, isError, error } = useMemberDashboard(identifier);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center border-red-500/20">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Compte introuvable
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Nous n&apos;avons pas pu trouver de compte avec l&apos;identifiant &quot;{identifier}&quot;. Veuillez vérifier votre saisie.
          </p>
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Réessayer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la recherche
        </Link>
      </div>

      <MemberDashboardView data={dashboardData} />
    </div>
  );
}
