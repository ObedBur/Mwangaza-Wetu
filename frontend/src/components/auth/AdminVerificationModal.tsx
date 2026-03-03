"use client";

import { useState } from "react";
import { Lock, X, Loader2, CheckCircle, AlertCircle, ShieldCheck, User } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { API_ROUTES } from "@/config/api";
import { toast } from "sonner";

interface AdminVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: (adminData: any) => void;
    title?: string;
}

export const AdminVerificationModal = ({
    isOpen,
    onClose,
    onVerified,
    title = "Validation Administrateur",
}: AdminVerificationModalProps) => {
    const [identifier, setIdentifier] = useState(""); // Email ou Numero de compte
    const [password, setPassword] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier || !password) return;

        setIsVerifying(true);
        setError(null);

        try {
            // On tente de se connecter en tant qu'admin pour vérifier les credentials
            const response = await apiClient.post(API_ROUTES.AUTH_ADMIN_LOGIN, {
                // Le backend accepte email OU numeroCompte
                email: identifier.includes("@") ? identifier : undefined,
                numeroCompte: !identifier.includes("@") ? identifier : undefined,
                password,
            });

            if (response.data?.success) {
                toast.success("Validation réussie !");
                onVerified(response.data.user);
                // On réinitialise pour la prochaine fois
                setIdentifier("");
                setPassword("");
            } else {
                setError("Identifiants invalides ou droits insuffisants.");
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.message || "Erreur lors de la vérification. Veuillez réessayer.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Decor */}
                <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary" />

                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                                <p className="text-xs text-slate-500 font-medium">Une autorisation est requise pour continuer</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Identifiant (Email / N° Compte)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="admin@mwangaza.com"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Mot de passe maître
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 flex items-center gap-3 animate-in shake duration-300">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isVerifying || !identifier || !password}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            {/* Shimmer */}
                            {!isVerifying && identifier && password && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
                            )}

                            {isVerifying ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            {isVerifying ? "Vérification..." : "Autoriser l'Action"}
                        </button>
                    </form>

                    <p className="mt-6 text-[10px] text-center text-slate-400 font-medium">
                        Cette action sera journalisée dans le registre de sécurité du système.
                    </p>
                </div>
            </div>
        </div>
    );
};
