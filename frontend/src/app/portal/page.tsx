"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Info, LogIn } from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Veuillez entrer un numéro de compte valide.");
      return;
    }
    // Redirige vers la vue personnalisée du membre
    router.push(`/portal/${identifier.trim()}`);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary/20">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            Espace Membre
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Consultez votre solde, vos épargnes et vos crédits en temps réel.
          </p>
        </div>

        <form onSubmit={handleSearch} className="glossy-card p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              Identifiant de compte
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: MW-PRI-123456"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError("");
                }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>
            {error && (
              <p className="text-red-500 text-xs font-medium mt-2 flex items-center gap-1.5 align-middle">
                <Info className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-3 font-medium flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-primary" />
              Saisissez exactement votre numéro de compte tel qu&apos;il apparaît sur votre carte de membre.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transform transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shimmer" />
            Accéder à mon tableau de bord
          </button>
        </form>
      </div>
    </div>
  );
}
