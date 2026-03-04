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
    name: new Date(d.month + "-01").toLocaleDateString('fr-FR', { month: 'short' })
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Évolution des Flux (Prises vs Retraits)
        </h2>
        <div className="flex gap-2">
           <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase border border-emerald-100 dark:border-emerald-800/30">
              USD Focus
           </span>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
              dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748B' }}
                tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }} />
            <Bar dataKey="depotsUSD" name="Dépôts ($)" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="retraitsUSD" name="Retraits ($)" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-2 h-10 bg-sky-500 rounded-full" />
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tendance Entrées</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Activité en hausse de +12%</p>
            </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-2 h-10 bg-rose-500 rounded-full" />
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tendance Sorties</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Stabilisation des retraits mensuels</p>
            </div>
        </div>
      </div>
    </div>
  );
}
