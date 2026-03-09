"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import AuthInput from "./AuthInput";
import AuthButton from "./AuthButton";

export default function FirstAccessGuard() {
    const { user, login } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { error: toastError, success: toastSuccess } = useToast();
    const queryClient = useQueryClient();

    if (!user || user.firstAcces !== true) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Le nouveau code/mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setIsLoading(true);
        try {
            const identifier = user.numero_compte || user.email;
            if (!identifier) {
                throw new Error("Identifiant utilisateur manquant.");
            }

            await authService.changePassword(identifier, newPassword);

            // Reconnecter automatiquement pour obtenir le nouveau token / utilisateur à jour
            const loginResponse = await authService.login({
                identifier: identifier,
                password: newPassword,
            });

            const updatedUserData = {
                id: loginResponse.user.id,
                email: loginResponse.user.email,
                role: loginResponse.user.role,
                numero_compte: loginResponse.user.numero_compte,
                nom_complet: loginResponse.user.nom_complet,
                firstAcces: false,
            };

            // Invalider les requêtes pour forcer le rafraîchissement du dashboard
            await queryClient.invalidateQueries({ queryKey: ['member-dashboard', identifier] });

            // On redirige vers le dashboard approprié selon le rôle
            login(loginResponse.token, updatedUserData, false);
            toastSuccess("Sécurisation réussie", "Votre mot de passe a été mis à jour.");
        } catch (err: any) {
            console.error("Change PIN error:", err);
            setError(err.message || "Erreur lors du changement de mot de passe.");
            toastError("Erreur", "Impossible de mettre à jour le mot de passe.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1A202C] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
                <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-accent to-primary"></div>

                <div className="p-6 sm:p-8">
                    <div className="text-center space-y-2 mb-6">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Action Requise</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Pour des raisons de sécurité, veuillez configurer votre nouveau mot de passe/code PIN personnalisé avant d'accéder à votre espace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <AuthInput
                                label="Nouveau mot de passe"
                                type="password"
                                placeholder="Minimum 6 caractères"
                                icon="lock"
                                showPasswordToggle
                                required
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError("");
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <AuthInput
                                label="Confirmez le mot de passe"
                                type="password"
                                placeholder="Répétez le mot de passe"
                                icon="lock"
                                showPasswordToggle
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError("");
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <AuthButton variant="primary" type="submit" loading={isLoading}>
                            Finaliser la sécurisation
                        </AuthButton>
                    </form>
                </div>
            </div>
        </div>
    );
}
