"use client";

import { use, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { ShieldCheck, Lock, Eye, EyeOff, ShieldAlert, KeyRound } from "lucide-react";

export default function SecuritePage({ params }: { params: Promise<{ id: string }> }) {
   const resolvedParams = use(params);
   const identifier = decodeURIComponent(resolvedParams.id);
   const { user } = useAuth();

   const [showPassword, setShowPassword] = useState(false);
   const [isChangingPassword, setIsChangingPassword] = useState(false);

   return (
      <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h1 className="text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight uppercase italic underline decoration-indigo-500/30 underline-offset-8">Sécurité du Compte</h1>
               <p className="text-[#64748B] dark:text-[#94A3B8] font-medium">Gérez vos accès et protégez vos informations personnelles.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
               <ShieldCheck className="w-7 h-7" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
               {/* Password Section */}
               <div className="bg-white dark:bg-[#0F172A] rounded-[40px] p-10 border border-slate-100 dark:border-white/5 shadow-sm space-y-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                     <Lock className="w-48 h-48 rotate-6 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-5 relative z-10">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center shadow-sm">
                        <KeyRound className="w-8 h-8" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight italic">Mot de Passe</h2>
                        <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest italic">Dernière modification : Il y a 3 mois</p>
                     </div>
                  </div>

                  {!isChangingPassword ? (
                     <div className="flex items-center justify-between p-6 bg-[#F8FAFC] dark:bg-[#020617] rounded-[2rem] border border-slate-100 dark:border-white/5 relative z-10 group-hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 shadow-inner" />)}
                           </div>
                        </div>
                        <button
                           onClick={() => setIsChangingPassword(true)}
                           className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] hover:scale-105 transition-all italic underline underline-offset-4"
                        >
                           Modifier
                        </button>
                     </div>
                  ) : (
                     <form className="space-y-6 animate-in fade-in zoom-in-95 duration-500 relative z-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest pl-4 italic">Mot de passe actuel</label>
                           <input type="password" className="w-full bg-[#F8FAFC] dark:bg-[#020617] rounded-[1.5rem] px-6 py-4 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold shadow-inner" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest pl-4 italic">Nouveau mot de passe</label>
                              <input type="password" className="w-full bg-[#F8FAFC] dark:bg-[#020617] rounded-[1.5rem] px-6 py-4 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold shadow-inner" />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest pl-4 italic">Confirmer</label>
                              <input type="password" className="w-full bg-[#F8FAFC] dark:bg-[#020617] rounded-[1.5rem] px-6 py-4 border border-slate-100 dark:border-white/5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold shadow-inner" />
                           </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                           <button type="button" onClick={() => setIsChangingPassword(false)} className="px-8 py-3 text-[#64748B] font-black text-xs uppercase tracking-widest italic hover:text-indigo-600 transition-colors">Annuler</button>
                           <button type="submit" className="px-10 py-4 bg-[#0F172A] dark:bg-[#F8FAFC] text-white dark:text-[#0F172A] rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:bg-indigo-600 hover:text-white transition-all italic active:scale-95">Mettre à jour</button>
                        </div>
                     </form>
                  )}
               </div>

               {/* Session Info */}
               <div className="bg-white dark:bg-[#0F172A] rounded-[40px] p-10 border border-slate-100 dark:border-white/5 shadow-sm border-l-8 border-l-indigo-600 group hover:shadow-lg transition-all">
                  <div className="flex justify-between items-center">
                     <div className="space-y-2">
                        <p className="text-sm font-black text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-tight italic">Session Actuelle</p>
                        <p className="text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest italic">Windows - Kinshasa, RDC</p>
                     </div>
                     <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/10 px-6 py-2 rounded-full border border-indigo-100 dark:border-indigo-900/20 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest italic tracking-tighter">En ligne</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] p-10 border border-indigo-100 dark:border-indigo-900/20 shadow-sm group">
                  <ShieldAlert className="w-10 h-10 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-[0.15em] mb-4 italic">Conseils MWANGAZA</h3>
                  <p className="text-[11px] font-bold text-indigo-700/70 dark:text-indigo-400/60 leading-relaxed italic uppercase tracking-wider">
                     Ne partagez jamais votre code PIN avec un tiers.
                     MWANGAZA ne vous demandera jamais vos identifiants secrets par téléphone.
                     Changez régulièrement vos accès pour une protection optimale.
                  </p>
               </div>

               <div className="bg-[#0F172A] dark:bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-500/20 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                     <ShieldCheck className="w-32 h-32" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight mb-3 italic relative z-10">Double Facteur (2FA)</h3>
                  <p className="text-[11px] font-medium opacity-80 mb-8 italic relative z-10 leading-relaxed">Activez la validation par SMS pour plus de sécurité lors de vos transactions sensibles.</p>
                  <button className="w-full py-5 bg-white text-indigo-600 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50 shadow-xl italic relative z-10">Activer le 2FA</button>
               </div>
            </div>
         </div>
      </div>
   );
}
