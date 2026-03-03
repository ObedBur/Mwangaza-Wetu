"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { repaymentSchema, RepaymentInput } from "@/lib/validations";
import { CURRENCIES } from "@/lib/constants";
import { useZkTeco } from "@/hooks/useZkTeco";
import { BiometricScanner } from "@/components/biometric";
import { AdminVerificationModal } from "@/components/auth/AdminVerificationModal";
import { useMemberByAccount, useMemberByZkId } from "@/hooks/useMembers";
import { useActiveCreditByAccount } from "@/hooks/useCredits";
import { MemberRecord } from "@/types";

interface CreateRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RepaymentInput) => void | Promise<void>;
}

export default function CreateRepaymentModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateRepaymentModalProps) {
  // État pour la validation admin avant soumission
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<RepaymentInput | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RepaymentInput>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      numeroCompte: "",
      pretId: "",
      montant: undefined as unknown as number,
      devise: "USD",
      date: new Date().toISOString().split("T")[0] as any,
      description: "",
      biometricValidated: false,
    },
  });

  const compte = watch("numeroCompte");
  const devise = watch("devise");

  // ─── Recherche de membre exact (pour Sidebar) ──────────────────────────
  const {
    data: exactMemberData,
    isFetching: isExactMemberFetching,
    isError: isExactMemberError,
  } = useMemberByAccount(compte, {
    enabled: compte?.length >= 5,
  });

  // ─── Biométrie ZKTeco ──────────────────────────────────────────────────
  const {
    isScanning: isBiometricPending,
    scanStatus: biometricStatus,
    scanError: biometricError,
    userId: biometricUserId,
    scanFingerprint: triggerScan,
    reset: resetBiometric,
  } = useZkTeco();

  // ─── Récupération automatique par ZK ID ───────────────────────────────
  const { data: memberByZk, isFetching: isFetchingByZk } = useMemberByZkId(
    biometricUserId,
    { enabled: biometricStatus === "success" }
  );

  const [identifiedPerson, setIdentifiedPerson] = useState<{
    name: string;
    role: "Membre" | "Délégué";
  } | null>(null);

  useEffect(() => {
    if (memberByZk && biometricUserId) {
      if (memberByZk.numeroCompte) {
        setValue("numeroCompte", memberByZk.numeroCompte, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      if (String(memberByZk.userId) === String(biometricUserId)) {
        setIdentifiedPerson({ name: memberByZk.nomComplet, role: "Membre" });
      } else if (memberByZk.delegues && memberByZk.delegues.length > 0) {
        const matchingDelegue = memberByZk.delegues.find(
          (d) => String(d.userId) === String(biometricUserId)
        );
        if (matchingDelegue) {
          setIdentifiedPerson({ name: matchingDelegue.nom, role: "Délégué" });
        }
      }
    } else if (!biometricUserId) {
      setIdentifiedPerson(null);
    }
  }, [memberByZk, biometricUserId, setValue]);

  // ─── Récupération du crédit actif du membre ─────────────────────────────
  const { data: activeCredit, isFetching: isFetchingCredit } = useActiveCreditByAccount(compte);

  useEffect(() => {
    if (activeCredit) {
      setValue("pretId", activeCredit.id.toString(), { shouldValidate: true });
      setValue("devise", activeCredit.devise, { shouldValidate: true });
      // On peut pré-remplir le montant avec le reste à payer ou le laisser vide
      // setValue("montant", activeCredit.remainingAmount, { shouldValidate: true });
    } else {
      setValue("pretId", "");
    }
  }, [activeCredit, setValue]);

  useEffect(() => {
    setValue("biometricValidated", biometricStatus === "success", {
      shouldValidate: biometricStatus === "success",
    });
  }, [biometricStatus, setValue]);

  useEffect(() => {
    if (!isOpen) {
      reset({
        numeroCompte: "",
        pretId: "",
        montant: undefined as unknown as number,
        devise: "USD",
        date: new Date().toISOString().split("T")[0] as any,
        description: "",
        biometricValidated: false,
      });
      resetBiometric();
      setIdentifiedPerson(null);
    }
  }, [isOpen, reset, resetBiometric]);

  if (!isOpen) return null;

  const isProfileLoading = isExactMemberFetching || isFetchingByZk;
  const profileData = (memberByZk || exactMemberData) as MemberRecord | null | undefined;
  const isProfileError = isExactMemberError && !profileData;

  const handleFormSubmit = (data: RepaymentInput) => {
    setPendingFormData(data);
    setIsAdminModalOpen(true);
  };

  const onAdminVerified = () => {
    if (!pendingFormData) return;
    onSubmit(pendingFormData);
    setIsAdminModalOpen(false);
    setPendingFormData(null);
  };

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
              <div className="relative p-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-primary/20 backdrop-blur-md border border-white/20 shadow-inner">
                <BiometricScanner
                  label="Remboursement"
                  status={biometricStatus}
                  error={biometricError}
                  userId={biometricUserId}
                  scanning={isBiometricPending}
                  onScan={triggerScan}
                />
              </div>
              {errors.biometricValidated && (
                <p className="text-red-500 text-[10px] mt-1 text-center">
                  {errors.biometricValidated.message}
                </p>
              )}

              {/* Mini profil membre */}
              <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 min-h-[72px]">
                {isProfileLoading ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ) : isProfileError ? (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Compte introuvable
                  </div>
                  ) : profileData ? (
                    <>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {profileData.nomComplet.substring(0, 2).toUpperCase()}
                      </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {profileData.nomComplet}
                          </p>
                          <p className="text-xs text-slate-500">
                            Membre #{profileData.id}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                            <CheckCircle className="w-3 h-3" />
                            <span>Compte Vérifié</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Saisissez un numéro de compte pour identifier le membre
                      </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-orange-600 shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-400">Sécurité Système</p>
                  <p className="text-[10px] text-orange-700 dark:text-orange-400 leading-tight">La validation administrateur sera demandée lors de la confirmation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Form */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto w-full">
              <div className="flex justify-between items-start mb-6 w-full">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Nouveau Remboursement
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Enregistrez un remboursement lié à un crédit existant.
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

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="space-y-4">

                  {/* Numero Compte & ID du Pret */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 space-y-2">
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Numéro de Compte
                        </label>
                        {identifiedPerson && (
                          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-100 dark:border-green-800/30 shadow-sm">
                              <CheckCircle className="w-3 h-3" /> {identifiedPerson.role} : {identifiedPerson.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        className={`block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-sm ${errors.numeroCompte
                          ? "border-red-400 ring-4 ring-red-400/10"
                          : "border-slate-100 dark:border-slate-800 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
                          }`}
                        placeholder="ex: MW-PRI-XXXXXX"
                        {...register("numeroCompte")}
                      />
                      {errors.numeroCompte && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.numeroCompte.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Crédit Actif
                      </label>
                      <div className={`w-full p-4 border-2 rounded-xl text-sm transition-all ${activeCredit
                        ? "bg-primary/5 border-primary/20"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"}`}>
                        {isFetchingCredit ? (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Recherche du crédit...</span>
                          </div>
                        ) : activeCredit ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">ID: {activeCredit.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeCredit.statut === 'en_retard' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {activeCredit.statut}
                              </span>
                            </div>
                              <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>Total: <b className="text-slate-700 dark:text-slate-300">{activeCredit.montant} {activeCredit.devise}</b></span>
                                <span>Reste: <b className="text-primary">{activeCredit.remainingAmount} {activeCredit.devise}</b></span>
                              </div>
                            </div>
                          ) : compte?.length >= 5 ? (
                            <div className="flex items-center gap-2 text-slate-500">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <span>Aucun crédit actif trouvé</span>
                            </div>
                            ) : (
                              <div className="text-slate-400 italic">
                                En attente du compte...
                              </div>
                        )}
                      </div>
                      {/* Hidden field for form submission */}
                      <input type="hidden" {...register("pretId")} />
                      {errors.pretId && !activeCredit && (
                        <p className="text-red-500 text-[11px] mt-1 font-medium">
                          {errors.pretId.message === "String must contain at least 1 character(s)" ? "Un crédit actif est requis" : errors.pretId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Montant & Devise */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Montant à rembourser
                    </label>
                    <div className="relative flex items-center">
                      <input
                        className={`block w-full pl-4 pr-24 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-lg font-black text-slate-900 dark:text-slate-100 placeholder-slate-300 focus:outline-none transition-all shadow-sm ${errors.montant
                          ? "border-red-400 ring-4 ring-red-400/10"
                          : "border-slate-100 dark:border-slate-800 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
                          }`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register("montant")}
                      />
                      <div className="absolute inset-y-1 right-1 flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <select
                          className="h-full py-0 pl-3 pr-8 bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-0 focus:ring-0 cursor-pointer"
                          {...register("devise")}
                        >
                          {CURRENCIES.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {errors.montant && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.montant.message}
                      </p>
                    )}
                  </div>

                  {/* Date Limite */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Date de Remboursement
                      </label>
                      <input
                        className={`block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-sm ${errors.date
                          ? "border-red-400 ring-4 ring-red-400/10"
                          : "border-slate-100 dark:border-slate-800 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
                          }`}
                        type="date"
                        {...register("date")}
                      />
                      {errors.date && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.date.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Description / Motif (Optionnel)
                    </label>
                    <textarea
                      className={`block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-sm min-h-[100px] resize-y ${errors.description
                        ? "border-red-400 ring-4 ring-red-400/10"
                        : "border-slate-100 dark:border-slate-800 focus:border-primary ring-0 focus:ring-4 focus:ring-primary/10"
                        }`}
                      placeholder="Saisissez un bref motif..."
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                </div>

                {/* Footer / Boutons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
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
                    className="px-6 py-3 bg-primary rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-primary transition-all flex items-center gap-2 group relative overflow-hidden active:scale-95"
                  >
                    {!isSubmitting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
                    )}
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Enregistrement..." : "Valider le Remboursement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <AdminVerificationModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onVerified={(admin) => {
          onAdminVerified();
        }}
        title="Validation Administrateur (Remboursement)"
      />
    </>
  );
}
