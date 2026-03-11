"use client";

import { use } from "react";
import { useMemberDashboard } from "@/hooks/useMemberDashboard";
import { PiggyBank, TrendingUp, Calendar, ArrowDownRight, IndianRupee } from "lucide-react";

export default function EpargnePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const identifier = decodeURIComponent(resolvedParams.id);
    const { data, isLoading } = useMemberDashboard(identifier);

    if (isLoading || !data) return null;

    const savingsTransactions = data.recentTransactions.filter(tx => tx.type === 'depot');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Mon Épargne</h1>
                    <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Gérez et suivez la croissance de vos économies.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                    <PiggyBank className="w-7 h-7" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-32 h-32 rotate-12" />
                    </div>
                    <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Total Épargne USD</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#0F172A] dark:text-[#F8FAFC]">${new Intl.NumberFormat("fr-FR").format(data.balances.savings.USD)}</span>
                        <span className="text-lg font-bold text-indigo-500">+{data.balances.cumulative.USD > 0 ? "8.5%" : "0%"}</span>
                    </div>
                    <p className="mt-4 text-xs font-bold text-[#64748B]">Croissance stable sur les 12 derniers mois.</p>
                </div>

                <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-8 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                        <PiggyBank className="w-32 h-32 -rotate-12" />
                    </div>
                    <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-2 italic">Total Épargne FC</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#0F172A] dark:text-[#F8FAFC]">{new Intl.NumberFormat("fr-FR").format(data.balances.savings.FC)} FC</span>
                    </div>
                    <p className="mt-4 text-xs font-bold text-[#64748B]">Indexé sur la valeur du marché local.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0F172A] rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC]/50 dark:bg-[#020617]/50">
                    <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight italic">Dépôts Récents</h2>
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Imprimer Relevé</button>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                    {savingsTransactions.length > 0 ? savingsTransactions.map((tx, i) => (
                        <div key={i} className="p-6 flex items-center justify-between hover:bg-[#F8FAFC] dark:hover:bg-[#020617]/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center shrink-0">
                                    <ArrowDownRight className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">Dépôt Épargne</p>
                                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase">{new Date(tx.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-xl text-indigo-500">+{tx.devise === 'USD' ? '$' : ''}{new Intl.NumberFormat("fr-FR").format(tx.montant)}{tx.devise === 'FC' ? ' FC' : ''}</p>
                                <p className="text-[10px] text-[#64748B] font-bold italic uppercase">Succès</p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center">
                            <p className="text-sm font-bold text-[#64748B] italic">Aucun dépôt enregistré</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
