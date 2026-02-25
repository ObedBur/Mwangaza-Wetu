"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Fingerprint, Loader2 } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { savingsSchema, SavingsInput } from "@/lib/validations";
import { CURRENCIES } from "@/lib/constants";

interface CreateDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SavingsInput) => void | Promise<void>;
}

export default function CreateDepositModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateDepositModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SavingsInput>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      numeroCompte: "ACC-98421",
      devise: "FC",
      date: new Date(),
      montant: 0,
      biometricValidated: false,
    },
  });

  const biometricValidated = watch("biometricValidated");
  const devise = watch("devise");

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-6 bg-primary/5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-primary">
                Nouvelle Épargne
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Saisissez les informations du dépôt
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 sm:p-6 space-y-5"
          >
            <div className="space-y-2">
              <FormField
                label="Numéro de Compte"
                type="text"
                {...register("numeroCompte")}
                error={errors.numeroCompte}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Devise
                </label>
                <select
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all appearance-none font-semibold ${
                    errors.devise
                      ? "border-red-500 focus:ring-red-500/20 text-red-900"
                      : "border-slate-200 dark:border-slate-700 focus:ring-primary/20"
                  }`}
                  {...register("devise")}
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
                {errors.devise && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.devise.message}
                  </p>
                )}
              </div>

              <FormField
                label="Date"
                type="date"
                {...register("date", { valueAsDate: true })}
                error={errors.date}
              />
            </div>

            <FormField
              label="Montant du Dépôt"
              type="number"
              placeholder="0.00"
              icon={<span className="font-bold">{devise}</span>}
              {...register("montant", { valueAsNumber: true })}
              error={errors.montant}
              className="text-lg sm:text-xl font-bold"
            />

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Validation Biométrique
              </label>
              <button
                type="button"
                onClick={() =>
                  setValue("biometricValidated", !biometricValidated, {
                    shouldValidate: true,
                  })
                }
                className={
                  biometricValidated
                    ? "w-full flex items-center justify-center gap-2 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"
                    : "w-full flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all text-slate-500"
                }
              >
                <Fingerprint className="w-6 h-6" />
                <span className="text-sm font-semibold">
                  {biometricValidated
                    ? "Biométrie validée (mock)"
                    : "Placer le doigt sur le scanner (mock)"}
                </span>
              </button>
              {errors.biometricValidated && (
                <p className="text-red-500 text-xs mt-1 text-center">
                  {errors.biometricValidated.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:hover:bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Validation..." : "Valider le dépôt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
