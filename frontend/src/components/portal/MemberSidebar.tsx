"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard, PiggyBank, Wallet, CreditCard,
    Handshake, History, User, ShieldCheck,
    TrendingUp, LogOut, HelpCircle, Sparkles, ChevronRight
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function MemberSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const memberId = user?.numero_compte || "";

    const navItems = [
        { icon: LayoutDashboard, label: "Vue d'ensemble", href: `/portal/${memberId}` },
        { icon: PiggyBank, label: "Mon Épargne", href: `/portal/${memberId}/epargne` },
        { icon: Wallet, label: "Retraits", href: `/portal/${memberId}/retrait` },
        { icon: CreditCard, label: "Mes Crédits", href: `/portal/${memberId}/credits` },
        { icon: Handshake, label: "Remboursement", href: `/portal/${memberId}/remboursement` },
        { icon: History, label: "Historique", href: `/portal/${memberId}/flux` },
        { icon: ShieldCheck, label: "Sécurité", href: `/portal/${memberId}/securite` },
    ];

    return (
        <aside className="hidden md:flex w-[300px] bg-[#F8FAFC] dark:bg-[#020617] shrink-0 flex-col h-screen sticky top-0 z-40 border-r border-slate-200/60 dark:border-white/5 p-6">

            {/* Branding - Indigo theme */}
            <div className="mb-10 px-2 flex items-center gap-3">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-blue-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative w-11 h-11 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/10">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                </div>
                <div>
                    <h1 className="text-[#0F172A] dark:text-[#F8FAFC] font-black text-xl tracking-tighter leading-none uppercase">
                        Mwangaza
                    </h1>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Coopérative</span>
                </div>
            </div>

            {/* Navigation - Glassmorphism Indigo Cards */}
            <nav className="flex-1 space-y-1.5">
                <p className="text-[11px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest ml-4 mb-4">Navigation</p>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`group flex items-center justify-between px-4 py-3.5 rounded-[1.2rem] transition-all duration-500 ${isActive
                                ? "bg-white dark:bg-slate-900 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.1)] border border-indigo-100 dark:border-white/5 text-indigo-600 scale-[1.02]"
                                : "text-[#64748B] dark:text-[#94A3B8] hover:bg-white/40 dark:hover:bg-white/5 hover:translate-x-1"
                                }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div className={`p-2 rounded-xl transition-all duration-500 ${isActive ? "bg-indigo-50 dark:bg-indigo-900/20 rotate-6" : "bg-transparent"}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-[#64748B] group-hover:text-indigo-500"}`} />
                                </div>
                                <span className={`text-sm tracking-tight ${isActive ? "font-black" : "font-semibold"}`}>{item.label}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 animate-in slide-in-from-left-2 duration-300" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer : Profile Section in Indigo theme */}
            <div className="p-2 mt-6">
                <div className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-5 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[2rem] bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg shadow-indigo-500/10">
                                <User className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC] leading-tight px-2">
                                {user?.nom_complet || "Membre"}
                            </p>
                            <div className="flex items-center justify-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-black uppercase tracking-widest">{user?.numero_compte}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-6">
                        <button className="flex flex-col items-center gap-1.5 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-white/5 group shadow-sm bg-white/20">
                            <HelpCircle className="w-5 h-5 text-[#64748B] group-hover:text-indigo-500" />
                            <span className="text-[9px] font-black uppercase text-[#64748B] tracking-tighter">Support</span>
                        </button>
                        <button
                            onClick={() => logout()}
                            className="flex flex-col items-center gap-1.5 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all border border-transparent hover:border-red-100 group shadow-sm bg-white/20"
                        >
                            <LogOut className="w-5 h-5 text-[#64748B] group-hover:text-red-500" />
                            <span className="text-[9px] font-black uppercase text-[#64748B] tracking-tighter group-hover:text-red-600">Quitter</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}