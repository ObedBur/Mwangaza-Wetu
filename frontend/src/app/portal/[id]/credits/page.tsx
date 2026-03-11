"use client";

import { use } from "react";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";
import { CreditCard, AlertCircle, CheckCircle2, TrendingDown } from "lucide-react";

export default function CreditsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const identifier = decodeURIComponent(resolvedParams.id);
    const { data, isLoading } = useMemberDashboard(identifier);

    if (isLoading || !data) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Mes Crédits</h1>
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Suivi détaillé de vos emprunts et calendrier de remboursement.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                    <CreditCard className="w-7 h-7" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-[#0F172A] rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-center text-center group">
                    <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-1 italic">Crédits Actifs</p>
                    <p className="text-5xl font-black text-indigo-600 group-hover:scale-110 transition-transform">{data.activeCreditsDetails.length}</p>
                </div>
                <div className="lg:col-span-3 bg-white dark:bg-[#0F172A] rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex flex-wrap gap-8 justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-1 italic">Total Restant USD</p>
                            <p className="text-3xl font-black text-indigo-600">${new Intl.NumberFormat("fr-FR").format(data.balances.activeCredits.USD)}</p>
                        </div>
                        <div className="h-12 w-px bg-slate-100 dark:bg-white/5 hidden md:block" />
                        <div>
                            <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-1 italic">Total Restant FC</p>
                            <p className="text-3xl font-black text-indigo-600">{new Intl.NumberFormat("fr-FR").format(data.balances.activeCredits.FC)} FC</p>
                        </div>
                        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/10 px-5 py-3 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20 shadow-sm shadow-indigo-500/5">
                            <AlertCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
                            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-tighter italic">Engagement Actif</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight italic">Détails par Crédit</h2>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-white/5" />
                </div>

                {data.activeCreditsDetails.length > 0 ? data.activeCreditsDetails.map((credit, i) => (
                    <div key={i} className="bg-white dark:bg-[#0F172A] rounded-[40px] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-105 transition-transform duration-700">
                            <TrendingDown className="w-56 h-56 -rotate-12" />
                        </div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Montant Emprunté</p>
                                    <p className="text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
                                        {credit.devise === 'USD' ? '$' : ''}{new Intl.NumberFormat("fr-FR").format(credit.montantInitial)}{credit.devise === 'FC' ? ' FC' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-[1.5rem] uppercase tracking-widest shadow-lg shadow-indigo-600/20">Taux {credit.tauxInteret}%</span>
                                    <span className="text-[10px] text-[#64748B] font-bold uppercase italic tracking-tighter">Depuis le {new Date(credit.dateDebut).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="space-y-6 flex flex-col justify-center">
                                <div>
                                    <div className="flex justify-between items-end mb-3">
                                        <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest italic">Remboursement</p>
                                        <span className="text-xl font-black text-indigo-600 italic">{credit.progression.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-4 bg-[#F8FAFC] dark:bg-[#020617] rounded-full overflow-hidden p-1 shadow-inner">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/40 relative" style={{ width: `${credit.progression}%` }}>
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[10px] font-black text-right text-[#64748B] uppercase tracking-widest italic">{new Intl.NumberFormat("fr-FR").format(credit.restant)} {credit.devise} restant</p>
                                </div>
                            </div>

                            <div className="flex items-center lg:justify-end">
                                <button className="w-full lg:w-auto px-8 py-4 bg-[#0F172A] dark:bg-[#F8FAFC] text-white dark:text-[#0F172A] rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none italic group-hover:bg-indigo-600 group-hover:text-white">Payer Tranche</button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-24 border-2 border-dashed border-slate-100 dark:border-white/5 text-center group">
                        <CheckCircle2 className="w-16 h-16 text-[#F8FAFC] dark:text-slate-800 mx-auto mb-6 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-[#64748B] font-black italic uppercase tracking-widest">Aucun crédit actif pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
