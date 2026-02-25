"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Fingerprint,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { loanSchema, LoanInput } from "@/lib/validations";

interface CreateCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoanInput) => void | Promise<void>;
}

export default function CreateCreditModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateCreditModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoanInput>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      numeroCompte: "acc-1",
      montant: 5000,
      devise: "USD",
      tauxInteret: 1.5,
      duree: 12,
      date: new Date(),
      biometricValidated: false,
      adminPassword: "",
    },
  });

  const watchAll = watch();
  const { montant, tauxInteret, duree, date, biometricValidated, devise } =
    watchAll;

  // Calculations
  const calculations = useMemo(() => {
    const totalInterest = (montant * tauxInteret * duree) / 100 / 12;
    const totalRepayment = montant + totalInterest;
    const monthlyPayment = totalRepayment / (duree || 1);

    // End date calculation
    const start = new Date(date);
    const end = new Date(start);
    if (!isNaN(end.getTime())) {
      end.setMonth(end.getMonth() + duree);
    }

    return {
      totalRepayment,
      monthlyPayment,
      endDate: isNaN(end.getTime())
        ? "--"
        : end.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
    };
  }, [montant, tauxInteret, duree, date]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
          {/* Sidebar: Biometric & Summary */}
          <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Sécurité
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Vérification Biométrique
                  </h3>
                </div>
              </div>

              {/* Scan Zone */}
              <button
                type="button"
                onClick={() =>
                  setValue("biometricValidated", !biometricValidated, {
                    shouldValidate: true,
                  })
                }
                className={`w-full relative cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
                  biometricValidated
                    ? "border-green-500/50 bg-green-50 dark:bg-green-900/10 hover:bg-green-100/50"
                    : "border-slate-300 dark:border-slate-600 hover:border-primary/40"
                }`}
              >
                <div className="relative h-20 w-20 flex items-center justify-center">
                  {biometricValidated && (
                    <div className="absolute inset-0 bg-green-500 opacity-20 rounded-full animate-pulse" />
                  )}
                  <Fingerprint
                    className={`text-5xl ${biometricValidated ? "text-green-600" : "text-primary"}`}
                  />
                  {biometricValidated && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`font-semibold text-sm ${biometricValidated ? "text-green-700" : "text-slate-900 dark:text-white"}`}
                  >
                    {biometricValidated
                      ? "Empreinte Validée"
                      : "En attente du scan..."}
                  </p>
                  {biometricValidated && (
                    <p className="text-green-600 text-xs">Match 99.8%</p>
                  )}
                </div>
              </button>
              {errors.biometricValidated && (
                <p className="text-red-500 text-[10px] mt-1 text-center">
                  {errors.biometricValidated.message}
                </p>
              )}

              {/* Member Mini Profile */}
              <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  JK
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    Jean Kabila
                  </p>
                  <p className="text-xs text-slate-500">Membre #88291</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Compte Vérifié</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Validation Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Validation Administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 w-4 h-4" />
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Mot de passe admin"
                  type={showPassword ? "text" : "password"}
                  {...register("adminPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.adminPassword.message}
                </p>
              )}
              <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                <span>Action requise pour montants &gt; $5,000</span>
              </p>
            </div>
          </div>

          {/* Main Content: Form */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Nouvelle Demande de Crédit
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Veuillez remplir les informations financières ci-dessous.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Account Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Account */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Compte d&apos;épargne source
                    </label>
                    <div className="relative">
                      <select
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                        {...register("numeroCompte")}
                      >
                        <option value="acc-1">
                          Compte Courant - USD (Solde: $12,450.00)
                        </option>
                        Compte Épargne - FC (Solde: 2,500,000 FC)
                      </select>
                    </div>
                    {errors.numeroCompte && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.numeroCompte.message}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Montant du crédit
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        type="number"
                        {...register("montant", { valueAsNumber: true })}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <select
                          className="border-0 bg-transparent text-slate-500 text-sm focus:ring-0 cursor-pointer"
                          {...register("devise")}
                        >
                          <option value="USD">USD</option>
                        </select>
                      </div>
                    </div>
                    {errors.montant && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.montant.message}
                      </p>
                    )}
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Taux d&apos;intérêt (%)
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        type="number"
                        step="0.1"
                        {...register("tauxInteret", { valueAsNumber: true })}
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                    {errors.tauxInteret && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.tauxInteret.message}
                      </p>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Durée (Mois)
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      type="number"
                      {...register("duree", { valueAsNumber: true })}
                    />
                    {errors.duree && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.duree.message}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Date de début
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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

                {/* Read-only Calculations */}
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 mt-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Date d&apos;échéance
                      </span>
                      <span className="block mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {calculations.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Mensualité estimée
                      </span>
                      <span className="block mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: devise || "USD",
                        }).format(calculations.monthlyPayment)}{" "}
                        / mois
                      </span>
                    </div>
                  </div>

                  {/* Total to Repay */}
                  <div className="border-t border-primary/10 pt-4">
                    <label className="block text-sm font-medium text-primary mb-1">
                      Total à Rembourser
                    </label>
                    <div className="bg-white dark:bg-slate-800 border border-primary/30 rounded-lg px-4 py-3 flex justify-between items-center shadow-sm">
                      <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: devise || "USD",
                        }).format(calculations.totalRepayment)}
                      </span>
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                        {devise}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-right">
                      Inclut capital + intérêts calculés
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-primary transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isSubmitting
                      ? "Enregistrement..."
                      : "Enregistrer la demande"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
