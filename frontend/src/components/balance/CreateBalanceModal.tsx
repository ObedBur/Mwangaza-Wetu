"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Fingerprint,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Wallet,
  User,
  PiggyBank,
  DollarSign,
  Loader2,
} from "lucide-react";
import { balanceSchema, BalanceInput } from "@/lib/validations";

interface CreateBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BalanceInput) => void | Promise<void>;
}

const accountTypes = [
  { value: "epargne", label: "Épargne" },
  { value: "credit", label: "Crédit" },
  { value: "interet", label: "Compte Intérêts" },
];

export default function CreateBalanceModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateBalanceModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BalanceInput>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
      numeroIdentite: "",
      typeCompte: "epargne",
      devise: "USD",
      soldeInitial: 0,
      biometricValidated: false,
      adminPassword: "",
    },
  });

  const biometricValidated = watch("biometricValidated");
  const devise = watch("devise");

  if (!isOpen) return null;

  const handleFormSubmit = (data: BalanceInput) => {
    onSubmit(data);
    reset();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
          <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 justify-between overflow-y-auto shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sécurité</p>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Vérification
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setValue("biometricValidated", !biometricValidated, {
                    shouldValidate: true,
                  })
                }
                className={`w-full relative cursor-pointer border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 group ${biometricValidated
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-lg shadow-emerald-500/10"
                  : "border-slate-300 dark:border-slate-600 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
              >
                <div className="relative h-24 w-24 flex items-center justify-center">
                  {biometricValidated && (
                    <div className="absolute inset-0 bg-emerald-500 opacity-20 rounded-full animate-ping" />
                  )}
                  <Fingerprint
                    className={`shrink-0 w-12 h-12 transition-all duration-500 ${biometricValidated ? "text-emerald-600 scale-110" : "text-slate-400 group-hover:text-primary"}`}
                  />
                  {biometricValidated && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-md border border-emerald-100">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-black uppercase tracking-widest ${biometricValidated ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}
                  >
                    {biometricValidated
                      ? "Empreinte Validée"
                      : "Placer le doigt"}
                  </p>
                </div>
              </button>
              {errors.biometricValidated && (
                <p className="text-red-500 text-[10px] mt-1 text-center">
                  {errors.biometricValidated.message}
                </p>
              )}

              <div className="mt-8 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-4 group/admin text-slate-400">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg shrink-0 border border-slate-200">
                  <User className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                    Administrateur
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session en cours</p>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
                Mot de passe Master
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="shrink-0 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  className="block w-full pl-11 pr-11 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                  placeholder="Autorisation requise"
                  type={showPassword ? "text" : "password"}
                  {...register("adminPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="shrink-0 w-4 h-4" />
                  ) : (
                    <Eye className="shrink-0 w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.adminPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-10 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      Ouverture de Compte
                    </h1>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest ml-4">
                    Initialisation du nouveau solde membre
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 transition-all p-3 rounded-2xl shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      ID Membre bénéficiaire
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="shrink-0 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        type="text"
                        placeholder="Ex: MEM-001"
                        {...register("numeroIdentite")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Type de produit
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <PiggyBank className="shrink-0 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <select
                        className="block w-full pl-11 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer transition-all"
                        {...register("typeCompte")}
                      >
                        {accountTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Devise opérationnelle
                    </label>
                    <select
                      className="block w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer transition-all"
                      {...register("devise")}
                    >
                      <option value="USD">DOLLARS AMÉRICAINS (USD)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Premier versement
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">
                        {devise === "USD" ? "$" : "FC"}
                      </div>
                      <input
                        className="block w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                        type="number"
                        min="0"
                        {...register("soldeInitial", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 pt-10 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group px-10 py-4 bg-slate-900 dark:bg-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white dark:text-slate-900 shadow-xl hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white disabled:opacity-60 transition-all flex items-center gap-3"
                  >
                    {isSubmitting ? (
                      <Loader2 className="shrink-0 w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="shrink-0 w-4 h-4 group-hover:scale-125 transition-transform" />
                    )}
                    {isSubmitting ? "Finalisation..." : "Confirmer l'ouverture"}
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
