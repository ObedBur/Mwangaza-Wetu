"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fingerprint, X, Loader2 } from "lucide-react";
import { withdrawalSchema, WithdrawalInput } from "@/lib/validations";

interface CreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WithdrawalInput) => void | Promise<void>;
  isLoading?: boolean;
}

export default function CreateWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateWithdrawalModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalInput>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      numeroCompte: "MW-98231-A",
      devise: "FC",
      date: new Date(),
      montant: 0,
      motif: "",
      biometricValidated: false,
      adminPassword: "",
    },
  });

  const biometricValidated = watch("biometricValidated");

  if (!isOpen) return null;

  const canSubmit = !isLoading && !isSubmitting;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-primary text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold">+</span>
              <h3 className="text-base sm:text-lg font-bold">
                Nouveau Retrait Sécurisé
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    setValue("biometricValidated", !biometricValidated, {
                      shouldValidate: true,
                    })
                  }
                  className={
                    biometricValidated
                      ? "w-full p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 flex flex-col items-center justify-center text-center space-y-3"
                      : "w-full p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3 hover:border-primary/40 transition-all"
                  }
                >
                  <div className="relative">
                    <Fingerprint
                      className={
                        biometricValidated
                          ? "w-12 h-12 text-emerald-500"
                          : "w-12 h-12 text-primary animate-pulse"
                      }
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Zone Biométrique
                    </p>
                    <p className="text-xs text-slate-500">
                      {biometricValidated
                        ? "Biométrie validée (mock)"
                        : "En attente du scan du membre..."}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded">
                    Lecteur Prêt
                  </span>
                </button>
                {errors.biometricValidated && (
                  <p className="text-red-500 text-xs text-center">
                    {errors.biometricValidated.message}
                  </p>
                )}
              </div>

              <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                  État du Compte
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Solde Actuel</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      8.450.000 FC
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                      Maximum Retirable
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      7.200.000 FC
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[85%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Numéro de Compte
                </label>
                <input
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  type="text"
                  {...register("numeroCompte")}
                />
                {errors.numeroCompte && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.numeroCompte.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Devise
                  </label>
                  <select
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    {...register("devise")}
                  >
                    <option value="FC">Francs (FC)</option>
                  </select>
                  {errors.devise && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.devise.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    type="date"
                    {...register("date", { valueAsDate: true })}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Montant du Retrait
                </label>
                <input
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder="0.00"
                  type="number"
                  {...register("montant", { valueAsNumber: true })}
                />
                {errors.montant && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.montant.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Motif de retrait
                </label>
                <textarea
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder="Ex: Frais de santé..."
                  rows={2}
                  {...register("motif")}
                />
                {errors.motif && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.motif.message}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Validation Administrateur
                </label>
                <input
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
                  placeholder="Mot de passe superviseur"
                  type="password"
                  {...register("adminPassword")}
                />
                {errors.adminPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.adminPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-primary transition-all flex items-center gap-2"
                >
                  {isLoading || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    "Valider la Transaction"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
