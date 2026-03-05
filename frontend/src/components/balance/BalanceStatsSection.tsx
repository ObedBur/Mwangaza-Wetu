import BalanceStatCard from '@/components/balance/BalanceStatCard';

interface BalanceStatsSectionProps {
  totalAccounts: number;
  totalBalanceUSD: number;
  totalBalanceFC: number;
  activeMembers: number;
  activeCredits: number;
}

export default function BalanceStatsSection({
  totalAccounts,
  totalBalanceUSD,
  totalBalanceFC,
  activeMembers,
  activeCredits,
}: BalanceStatsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Vue d'Ensemble</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Performances globales de la caisse</p>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mx-8 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <BalanceStatCard
          title="Membres Actifs"
          value={activeMembers.toString()}
          trend={`${totalAccounts} comptes totaux`}
          icon="users"
          color="blue"
        />
        <BalanceStatCard
          title="Solde Total (USD)"
          value={`$${totalBalanceUSD.toLocaleString('fr-FR')}`}
          trend="Total épargne USD"
          icon="wallet"
          color="green"
        />
        <BalanceStatCard
          title="Solde Total (FC)"
          value={`${totalBalanceFC.toLocaleString('fr-FR')} FC`}
          trend="Total épargne FC"
          icon="savings"
          color="amber"
        />
        <BalanceStatCard
          title="Crédits Actifs"
          value={activeCredits.toString()}
          trend="Prêts en cours"
          icon="credit"
          color="purple"
        />
      </div>
    </section>
  );
}
