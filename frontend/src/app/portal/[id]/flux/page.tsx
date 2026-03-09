"use client";

import { use, useState } from "react";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";
import { History, Search, Filter, Download, ArrowDownRight, ArrowUpRight, Handshake } from "lucide-react";

export default function FluxPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id);
  const { data, isLoading } = useMemberDashboard(identifier);
  const [filter, setFilter] = useState<'all' | 'depot' | 'retrait' | 'remboursement'>('all');

  if (isLoading || !data) return null;

  const filteredTransactions = data.recentTransactions.filter(tx =>
    filter === 'all' ? true : tx.type === filter
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'depot': return <ArrowDownRight className="w-6 h-6" />;
      case 'retrait': return <ArrowUpRight className="w-6 h-6" />;
      case 'remboursement': return <Handshake className="w-6 h-6" />;
      default: return <History className="w-6 h-6" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'depot': return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10';
      case 'retrait': return 'bg-slate-100 text-slate-600 dark:bg-[#020617]';
      case 'remboursement': return 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Historique des Flux</h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Consultez l&apos;intégralité de vos activités financières.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-4 bg-[#0F172A] dark:bg-[#F8FAFC] text-white dark:text-[#0F172A] rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200 dark:shadow-none italic active:scale-95">
          <Download className="w-4 h-4" />
          Exporter Relevé
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-[#F8FAFC] dark:bg-[#020617] p-1.5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner">
          {(['all', 'depot', 'retrait', 'remboursement'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-lg" : "text-[#64748B] hover:text-indigo-600"
                }`}
            >
              {f === 'all' ? 'Tous' : f === 'depot' ? 'Dépôts' : f === 'retrait' ? 'Retraits' : 'Crédits'}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] group-focus-within:text-indigo-600 transition-colors" />
          <input type="text" placeholder="Rechercher..." className="pl-11 pr-6 py-3 bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-48 focus:w-64" />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-50 dark:divide-white/5">
          {filteredTransactions.length > 0 ? filteredTransactions.map((tx, i) => (
            <div key={i} className="p-8 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#020617]/50 transition-colors group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getColor(tx.type)} transition-transform group-hover:scale-110`}>
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight text-lg italic">
                    {tx.type === 'depot' ? 'Dépôt Épargne' : tx.type === 'retrait' ? 'Retrait Espèces' : 'Remboursement Crédit'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider">{new Date(tx.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10" />
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold italic truncate max-w-[200px] group-hover:text-indigo-600 transition-colors">{tx.description || "Aucune description"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-2xl ${tx.type === 'depot' ? 'text-indigo-600' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>
                  {tx.type === 'depot' ? '+' : '-'}{tx.devise === 'USD' ? '$' : ''}{new Intl.NumberFormat("fr-FR").format(tx.montant)}{tx.devise === 'FC' ? ' FC' : ''}
                </p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'depot' ? 'bg-indigo-500' : 'bg-slate-400'} animate-pulse`} />
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter italic">Validé</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-32 text-center group">
              <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#020617] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <History className="w-10 h-10 text-slate-200 dark:text-slate-800" />
              </div>
              <p className="text-[#64748B] font-black italic uppercase tracking-widest">Aucune transaction correspondant à vos critères.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
