"use client";

import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const firstName = user?.nom_complet?.split(' ')[0] || "Membre";
  const isMember = user?.numero_compte && (user.role?.toUpperCase() === 'MEMBRE' || !user.role);

  return (
    <nav className="absolute top-0 left-0 w-full p-4 sm:p-6 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Logo and Company Name - Hidden on desktop when sidebar is present */}
        <div className="hidden sm:flex md:hidden items-center gap-2 sm:gap-4 shrink-0">
          <div className="h-10 w-10 sm:h-14 sm:w-14 relative shrink-0">
            <Image
              src="/logo.jpg"
              alt="Mwangaza Wetu Logo"
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
          <div className="hidden sm:block border-l border-slate-200 dark:border-slate-700 pl-4 h-10">
            <h2 className="text-xs sm:text-sm font-black text-primary dark:text-white tracking-tight leading-none uppercase">
              MINI-COOPERATIVE D&apos;EPARGNE
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-bold dark:text-gray-400 mt-1">
              MWANGAZA WETU
            </p>
          </div>
        </div>

        {/* Logo for mobile only when the above is hidden by md:hidden */}
        <div className="md:hidden">
          <div className="h-10 w-10 relative shrink-0">
            <Image src="/logo.jpg" alt="Logo" fill className="object-contain rounded-lg" />
          </div>
        </div>

        {/* Center/Right Side: Welcome Message and Controls (Only for Members) */}
        {isAuthenticated && isMember && (
          <div className="flex-1 flex items-center justify-end md:justify-between gap-6 ml-4 sm:ml-8">
            <div className="hidden md:block">
              <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none">
                Bonjour, {firstName} 👋
              </h1>
              <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mt-1">
                Portail Membre Sécurisé
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex bg-white dark:bg-[#0F172A] rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-white/5">
                <button className="px-4 py-1.5 rounded-xl text-xs font-black bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white transition-all uppercase tracking-tighter">Mois</button>
                <button className="px-4 py-1.5 rounded-xl text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:text-indigo-600 dark:hover:text-indigo-400 transition-all uppercase tracking-tighter">Année</button>
              </div>
              <NotificationBell
                membreId={user?.id ? parseInt(user.id) : undefined}
                membreNumero={user?.numero_compte}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
