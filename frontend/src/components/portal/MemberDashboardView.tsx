"use client";

import { useMemo } from "react";
import { MemberDashboardData } from "@/hooks/useMemberDashboard";
import { 
  PiggyBank, CreditCard, ArrowUpRight,
  ArrowDownRight, RefreshCw, ChevronDown,
  PieChart, Landmark, TrendingUp, HandCoins, Sparkles
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function MemberDashboardView({ data }: { data: MemberDashboardData }) {
  const { profile, balances, activeCreditsDetails, recentTransactions, monthlyHistory } = data;



  const totalUSD = balances.cumulative.USD + balances.activeCredits.USD;
  const totalFC = balances.cumulative.FC + balances.activeCredits.FC;

  const transactions = useMemo(() => {
    return recentTransactions.slice(0, 5).map((tx, idx) => {
      const isPositive = tx.type === "depot";
      const isCredit = tx.type === "remboursement";

      let Icon = RefreshCw;
      let bgColor = "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600";

      if (tx.type === 'depot') {
        Icon = ArrowDownRight;
        bgColor = "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600";
      } else if (tx.type === 'retrait') {
        Icon = ArrowUpRight;
        bgColor = "bg-slate-100 dark:bg-slate-800 text-slate-600";
      } else if (tx.type === 'remboursement') {
        Icon = HandCoins;
        bgColor = "bg-indigo-600 text-white";
      }

      return (
        <div 
          key={idx} 
          className="flex items-center justify-between p-3 sm:p-4 hover:bg-[#F8FAFC] dark:hover:bg-[#020617]/50 transition-colors group cursor-default rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${bgColor} group-hover:scale-110 transition-transform shadow-sm`}>
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm sm:text-base">
                {tx.type === 'depot' ? 'Dépôt Épargne' :
                  tx.type === 'retrait' ? 'Retrait Effectué' :
                    tx.type === 'remboursement' ? 'Paiement Crédit' : tx.type}
              </p>
              <p className="text-[10px] sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-medium capitalize">
                {new Date(tx.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`font-black text-sm sm:text-lg ${isPositive ? 'text-indigo-600' : isCredit ? 'text-indigo-600' : 'text-[#64748B]'}`}>
              {isPositive ? "+" : "-"}{tx.devise === "USD" ? "$" : ""}{new Intl.NumberFormat("fr-FR").format(tx.montant)}{tx.devise === "FC" ? " FC" : ""}
            </p>
          </div>
        </div>
      );
    });
  }, [recentTransactions]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">

      <div className="pt-2 sm:pt-4" /> 

      {/* ─── MAIN CARDS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* USD Card */}
        <div className="relative overflow-hidden bg-white dark:bg-[#0F172A] rounded-[32px] p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05]">
            <Landmark className="w-48 h-48 -rotate-12 text-indigo-500" />
          </div>
          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Solde Total en USD</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-6xl font-black text-[#64748B] dark:text-[#94A3B8] leading-none tracking-tighter">$</span>
                <span className="text-4xl sm:text-6xl font-black text-[#0F172A] dark:text-[#F8FAFC] leading-none tracking-tighter">
                  {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(Math.floor(totalUSD))}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#64748B] dark:text-[#94A3B8] leading-none">
                  .{((totalUSD % 1) * 100).toFixed(0).padStart(2, '0')}
                </span>
              </div>
            </div>


          </div>
        </div>

        {/* FC Card */}
        <div className="relative overflow-hidden bg-white dark:bg-[#0F172A] rounded-[32px] p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05]">
            <Landmark className="w-48 h-48 -rotate-12 text-indigo-500" />
          </div>
          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Solde Total en FC</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-6xl font-black text-[#0F172A] dark:text-[#F8FAFC] leading-none tracking-tighter">
                  {new Intl.NumberFormat("fr-FR").format(totalFC)}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#64748B] leading-none uppercase">FC</span>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* ─── MIDDLE SECTION: CHART AND FEED ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evolution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Évolution Financière</h2>
              <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.2em] mt-3">Analyse comparative des flux (6 mois)</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 bg-[#F8FAFC] dark:bg-[#020617] p-3 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-sm shadow-indigo-600/20" />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter">Épargne</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full shadow-sm" />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter">Retrait</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-500 rounded-full shadow-sm shadow-sky-500/20" />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter">Crédit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-violet-600 rounded-full shadow-sm shadow-violet-600/20" />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter">Remb.</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" strokeOpacity={0.5} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8', textAnchor: 'middle' }}
                  dy={15}
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  domain={[0, 'auto']}
                  ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '24px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  cursor={{ stroke: '#4F46E5', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="epargne"
                  stroke="#4F46E5"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorEp)"
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="credit"
                  stroke="#0EA5E9"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorCr)"
                  strokeDasharray="10 5"
                />
                <Area
                  type="monotone"
                  dataKey="remboursement"
                  stroke="#8B5CF6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRe)"
                />
                <Area
                  type="monotone"
                  dataKey="retrait"
                  stroke="#94A3B8"
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray="3 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Flux */}
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase">Flux Récents</h2>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">Voir tout</button>
          </div>
          <div className="space-y-1">
            {transactions.length > 0 ? transactions : (
              <div className="text-center py-20">
                <p className="text-xs font-bold text-[#64748B] italic">Aucune transaction trouvée</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM SECTION: OBJECTIVES ─── */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] mb-1">Objectifs du Mois</h3>
                <p className="text-xs font-bold text-[#64748B] capitalize">Objectif d&apos;épargne: $10,000.00</p>
              </div>
              <span className="text-2xl font-black text-indigo-600 italic">82%</span>
            </div>
            <div className="w-full bg-[#F8FAFC] dark:bg-[#020617] rounded-full h-4 overflow-hidden p-1 shadow-inner">
              <div className="bg-indigo-600 h-full rounded-full w-[82%] shadow-lg shadow-indigo-600/40 relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10 lg:px-10">
            <div className="text-center">
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1 italic">Revenus</p>
              <p className="text-xl font-black text-indigo-600">+${new Intl.NumberFormat("fr-FR").format(balances.cumulative.USD)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1 italic">Dépenses</p>
              <p className="text-xl font-black text-slate-400">
                -${new Intl.NumberFormat("fr-FR").format(balances.cumulative.USD - balances.savings.USD)}
              </p>
            </div>
          </div>

          <button className="w-full lg:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
            <Sparkles className="w-5 h-5" />
            Virement Express
          </button>
        </div>
      </div>

    </div>
  );
}
