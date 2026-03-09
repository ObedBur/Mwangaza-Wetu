"use client";

import { use } from "react";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";
import { Handshake, Calendar, TrendingDown, ArrowLeftRight } from "lucide-react";

export default function RemboursementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id);
  const { data, isLoading } = useMemberDashboard(identifier);

  if (isLoading || !data) return null;

  const refundTransactions = data.recentTransactions.filter(tx => tx.type === 'remboursement');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Remboursements</h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Gérez vos échéances et consultez vos paiements de crédit.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Handshake className="w-7 h-7" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-[40px] p-10 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-105 transition-transform duration-700">
          <TrendingDown className="w-64 h-64 -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-3 text-center md:text-left">
            <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.2em] italic">Total remboursé à ce jour</p>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-5xl sm:text-7xl font-black text-indigo-600">
                ${new Intl.NumberFormat("fr-FR").format(data.balances.cumulative.USD - data.balances.savings.USD)}
              </span>
            </div>
            <p className="text-xs font-bold text-[#64748B] opacity-60">Calculé sur la base de vos transactions historiques.</p>
          </div>
          <button className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all active:scale-95 italic">Rembourser maintenant</button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-[#020617]/50">
          <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight italic">Historique des Paiements</h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {refundTransactions.length > 0 ? refundTransactions.map((tx, i) => (
            <div key={i} className="p-8 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#020617]/50 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Handshake className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-lg">Paiement Tranche Crédit</p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">{new Date(tx.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-indigo-600">-{tx.devise === 'USD' ? '$' : ''}{new Intl.NumberFormat("fr-FR").format(tx.montant)}{tx.devise === 'FC' ? ' FC' : ''}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <p className="text-[10px] text-[#64748B] font-bold italic uppercase tracking-tighter">Transaction validée</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-24 text-center group">
              <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#020617] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-10 h-10 text-slate-200 dark:text-slate-800" />
              </div>
              <p className="text-[#64748B] font-black italic uppercase tracking-widest">Aucun remboursement effectué</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
