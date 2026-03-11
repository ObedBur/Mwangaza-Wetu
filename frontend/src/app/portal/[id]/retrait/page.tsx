"use client";

import { use } from "react";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";
import { Wallet, ArrowUpRight, History, Clock } from "lucide-react";

export default function RetraitPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const identifier = decodeURIComponent(resolvedParams.id);
    const { data, isLoading } = useMemberDashboard(identifier);

    if (isLoading || !data) return null;

    const withdrawalTransactions = data.recentTransactions.filter(tx => tx.type === 'retrait');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Mes Retraits</h1>
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Historique de vos sorties de fonds et disponibilités.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                    <Wallet className="w-7 h-7" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-[40px] p-8 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-105 transition-transform duration-700">
                        <History className="w-48 h-48 -rotate-12 text-slate-400" />
                    </div>
                    <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight mb-8 italic">Résumé des Sorties</h2>
                    <div className="flex items-center justify-around py-6 bg-[#F8FAFC] dark:bg-[#020617] rounded-[2.5rem] border border-slate-50 dark:border-white/5">
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Dernier Retrait</p>
                            <p className="text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC]">
                                {withdrawalTransactions[0] ? `${withdrawalTransactions[0].devise === 'USD' ? '$' : ''}${new Intl.NumberFormat("fr-FR").format(withdrawalTransactions[0].montant)}` : "None"}
                            </p>
                        </div>
                        <div className="w-px h-16 bg-slate-200 dark:bg-white/10" />
                        <div className="text-center px-4">
                            <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Volume Total</p>
                            <p className="text-3xl font-black text-indigo-600">{withdrawalTransactions.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 dark:bg-indigo-900 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-3 italic">Besoin d&apos;assistance ?</p>
                        <h3 className="text-2xl font-black leading-[1.1] mb-6">Sorties de fonds rapides & sécurisées</h3>
                        <p className="text-xs font-medium opacity-80 leading-relaxed italic">Présentez-vous à n&apos;importe quel guichet MWANGAZA muni de votre identifiant et votre code secret.</p>
                    </div>
                    <button className="mt-10 w-full py-5 bg-white text-indigo-600 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl italic">Trouver un guichet</button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-[#020617]/50">
                    <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight italic">Historique des Retraits</h2>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                    {withdrawalTransactions.length > 0 ? withdrawalTransactions.map((tx, i) => (
                        <div key={i} className="p-8 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#020617]/50 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#020617] text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5 shadow-sm">
                                    <ArrowUpRight className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-lg">Retrait au Guichet</p>
                                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-widest italic">{new Date(tx.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-2xl text-[#64748B] dark:text-[#94A3B8]">-{tx.devise === 'USD' ? '$' : ''}{new Intl.NumberFormat("fr-FR").format(tx.montant)}{tx.devise === 'FC' ? ' FC' : ''}</p>
                                <div className="flex items-center justify-end gap-1.5 mt-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <span className="text-[10px] text-[#64748B] font-bold italic uppercase tracking-tighter">Flux confirmé</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-24 text-center group">
                            <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#020617] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-50 transition-colors">
                                <Clock className="w-10 h-10 text-slate-200 dark:text-slate-800" />
                            </div>
                            <p className="text-[#64748B] font-black italic uppercase tracking-widest">Aucun retrait récent</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
