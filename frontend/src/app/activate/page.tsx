"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useActivateMember } from "@/hooks/useMembers";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ActivationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("t");
  const { mutate: activate, isPending } = useActivateMember();
  const { success: toastSuccess, error: toastError } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toastError("Lien invalide", "Le jeton d'activation est manquant.");
      return;
    }

    if (password.length < 6) {
      toastError("Sécurité faible", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      toastError("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    activate(
      { token, motDePasse: password },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toastSuccess("Compte activé !", "Vous pouvez maintenant vous connecter.");
          setTimeout(() => {
            router.push("/");
          }, 3000);
        },
        onError: (err: any) => {
          toastError("Certification échouée", err.response?.data?.message || "Lien invalide ou expiré.");
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-2xl border border-green-100 animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-200">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-green-900 mb-2 text-center">Activation Réussie !</h2>
        <p className="text-green-700 text-center text-sm font-medium">
          Votre compte est maintenant prêt. Redirection vers la page de connexion dans quelques secondes...
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl border border-red-100">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-bold text-red-900 mb-2">Lien Expiré ou Invalide</h2>
        <p className="text-red-700 text-center text-sm">
          Ce lien d'activation n'est plus valable. Veuillez contacter la coopérative pour en obtenir un nouveau via votre empreinte.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-6">
      <div className="flex flex-col gap-1 items-center mb-2">
        <div className="p-3 bg-primary/10 rounded-2xl mb-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight">Activez votre Compte</h1>
        <p className="text-slate-500 text-xs text-center font-medium">
          Définissez votre secret pour accéder à votre espace mobile Mwangaza Wetu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nouveau Mot de Passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
            placeholder="••••••"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirmer le Mot de Passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
            placeholder="••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finaliser l'Activation"}
        </button>
      </form>

      <div className="pt-4 border-t border-slate-50 text-[10px] text-slate-400 text-center leading-relaxed">
        Votre sécurité est notre priorité. Ne partagez jamais votre mot de passe avec qui que ce soit, pas même un employé de la coopérative.
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-primary" />}>
        <ActivationForm />
      </Suspense>
    </main>
  );
}
