"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp } from "lucide-react";

interface HistoryData {
  month: string;
  depotsUSD: number;
  retraitsUSD: number;
  depotsFC: number;
  retraitsFC: number;
}

export default function SoldeHistoryChart({ data }: { data: HistoryData[] }) {
  // Traduction des mois pour l'affichage
  const chartData = data.map(d => ({
    ...d,
    name: new Date(d.month + "-01").toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 group hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter uppercase">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
            Flux de Trésorerie
          </h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-12">Performance des 6 derniers mois (USD)</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 rounded-lg shadow-sm">Mensuel</button>
          <button className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Annuel</button>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDepots" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRetraits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.1} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8', letterSpacing: '0.1em' }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
              tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
              labelStyle={{ color: '#94A3B8', fontWeight: 900, fontSize: '10px', marginBottom: '4px', textAlign: 'center' }}
              cursor={{ stroke: '#0EA5E9', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="depotsUSD"
              name="Entrées"
              stroke="#0EA5E9"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorDepots)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="retraitsUSD"
              name="Sorties"
              stroke="#F43F5E"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRetraits)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group/card flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl group-hover/card:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Ratio de croissance</p>
            <p className="text-sm font-black text-slate-900 dark:text-slate-200 tracking-tight">Analyse en cours... <span className="text-slate-400 font-bold ml-1">chargement</span></p>
          </div>
        </div>
        <div className="relative group/card flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl group-hover/card:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 rotate-180" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Flux opérationnels</p>
            <p className="text-sm font-black text-slate-900 dark:text-slate-200 tracking-tight">Temps réel <span className="text-slate-400 font-bold ml-1">Dernière mise à jour</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
