"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import MemberDashboardView from "@/components/portal/MemberDashboardView";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";
import { useAuth } from "@/providers/AuthProvider";

export default function PortalMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  // Déballer les params asynchrones
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id);

  const { data: dashboardData, isLoading, isError, error } = useMemberDashboard(identifier);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // On attend que le chargement soit fini
    if (isLoading) return;

    const userRole = user?.role?.toUpperCase();
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    if (isAdmin) {
      router.replace('/dashboard');
      return;
    }

    if (user?.numero_compte !== identifier) {
      router.replace('/');
      return;
    }

    // Gestion de l'erreur de chargement du dashboard
    if (isError || !dashboardData) {
      // Si l'utilisateur doit encore changer son mot de passe, on RESTE ici pour voir la modal
      if (user?.firstAcces === true) {
        return;
      }

      // Sinon, s'il y a une vraie erreur (ex: 404), on redirige
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user, identifier, isError, dashboardData, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Chargement de votre espace...</p>
      </div>
    );
  }

  const userRole = user?.role?.toUpperCase();
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  // Hide content while redirecting or in case of error
  if (!isAuthenticated || user?.numero_compte !== identifier || isError || !dashboardData || isAdmin) {
    return null;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MemberDashboardView data={dashboardData} />
    </div>
  );
}
