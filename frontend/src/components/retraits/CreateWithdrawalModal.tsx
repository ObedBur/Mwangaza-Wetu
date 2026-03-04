"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  Search,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { withdrawalSchema, WithdrawalInput } from "@/lib/validations";
import { CURRENCIES } from "@/lib/constants";
import { useZkTeco } from "@/hooks/useZkTeco";
import { BiometricScanner } from "@/components/biometric";
import { AdminVerificationModal } from "@/components/auth/AdminVerificationModal";
import { useMemberByZkId, useMemberSearch, useMemberByAccount } from "@/hooks/useMembers";
import { useAccountSoldes } from "@/hooks/useSavings";
import { MemberRecord } from "@/types";

interface CreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WithdrawalInput) => void | Promise<void>;
}

export default function CreateWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateWithdrawalModalProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [identifiedPerson, setIdentifiedPerson] = useState<{
    name: string;
    role: "Membre" | "Délégué";
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // État pour la validation admin avant soumission
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<WithdrawalInput | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalInput>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      compte: "",
      devise: "FC",
      dateOperation: new Date().toISOString().split("T")[0] as any,
      montant: 0,
      description: "",
      biometricValidated: false,
    },
  });

  const devise = watch("devise");
  const compte = watch("compte");

  // ─── Recherche de membre par query (Autocomplete) ─────────────────────
  const { data: searchResults, isFetching: isSearching } = useMemberSearch(
    compte,
    { enabled: showSuggestions }
  );

  const {
    data: exactMemberData,
    isFetching: isExactMemberFetching,
    isError: isMemberNotFound,
  } = useMemberByAccount(compte, {
    enabled: compte?.length >= 5 && !showSuggestions,
  });

  // ─── Récupération du solde en temps réel ────────────────────────────────
  const { data: soldes, isFetching: isSoldesFetching } = useAccountSoldes(compte, {
    enabled: !!compte && !showSuggestions,
  });

  const currentSolde = devise === "FC" ? soldes?.soldeFC : soldes?.soldeUSD;
  const isBalanceInsufficient = watch("montant") > (currentSolde || 0);

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

  // Automatisation : dès que le membre est trouvé par ZK ID, on remplit le compte et on identifie le porteur
  useEffect(() => {
    if (memberByZk && biometricUserId) {
      if (memberByZk.numeroCompte) {
        setValue("compte", memberByZk.numeroCompte, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      // Identifier si c'est le membre ou l'un de ses délégués
      if (String(memberByZk.userId) === String(biometricUserId)) {
        setIdentifiedPerson({ name: memberByZk.nomComplet ?? '', role: "Membre" });
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

  // Synchroniser l'état validé du formulaire avec le résultat du scan
  useEffect(() => {
    setValue("biometricValidated", biometricStatus === "success", {
      shouldValidate: biometricStatus === "success",
    });
  }, [biometricStatus, setValue]);

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      reset({
        compte: "",
        devise: "FC",
        dateOperation: new Date().toISOString().split("T")[0] as any,
        montant: 0,
        description: "",
        biometricValidated: false,
      });
      resetBiometric();
      setShowSuggestions(false);
    }
  }, [isOpen, reset, resetBiometric]);

  const handleSelectMember = (member: MemberRecord) => {
    setValue("compte", member.numeroCompte, { shouldValidate: true });
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const isProfileLoading = isExactMemberFetching || isFetchingByZk;
  const profileData = (memberByZk || exactMemberData) as MemberRecord | null | undefined;
  const isProfileError = isMemberNotFound && !profileData;

  const memberInitials = profileData?.nomComplet
    ? profileData.nomComplet.substring(0, 2).toUpperCase()
    : null;

  const memberFullName = profileData?.nomComplet || null;

  const handleFormSubmit = (data: WithdrawalInput) => {
    if (isBalanceInsufficient) {
      return; // Ne pas soumettre si le solde est insuffisant
    }
    setPendingFormData(data);
    setIsAdminModalOpen(true);
  };

  const onAdminVerified = () => {
    if (!pendingFormData) return;
    onSubmit(pendingFormData);
    setIsAdminModalOpen(false);
    setPendingFormData(null);
  };

  const memberId = exactMemberData?.id || null;

  const handleWithdrawalSubmit = (data: WithdrawalInput) => {
    if (isBalanceInsufficient) {
      return; // Ne pas soumettre si le solde est insuffisant
    }
    onSubmit(data);
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
              {/* Scanner biométrique */}
              <div className="relative p-1 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-md border border-white/20 shadow-inner">
                <BiometricScanner
                  label="Retrait"
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

              {/* L'affichage "Scanné par : Délégué/Membre" a été déplacé au-dessus de l'input et n'est plus dupliqué ici */}

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
                    <div className="h-12 w-12 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                      {profileData.nomComplet?.substring(0, 2).toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {profileData.nomComplet ?? '—'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Membre #{profileData.id}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-2.5 h-2.5" />
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

            <div className="mt-auto border-t border-slate-200 dark:border-slate-700 pt-6">
              <p className="text-[10px] text-slate-400">
                Assurez-vous de vérifier l&apos;identité du porteur avant de valider.
              </p>
            </div>
          </div>

          {/* Main Content: Form */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Nouveau Retrait
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Saisissez les informations relatives au retrait d&apos;argent.
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
                {/* Account Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Champ Numéro de Compte avec Autocomplete */}
                  <div className="col-span-1 md:col-span-2 space-y-2 relative" ref={dropdownRef}>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Numéro de compte d&apos;épargne
                      </label>
                      {biometricStatus === "success" && (
                        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                          {isFetchingByZk ? (
                            <span className="flex items-center gap-1.5 text-[10px] text-red-600 font-bold uppercase tracking-wider">
                              <Loader2 className="w-3 h-3 animate-spin" /> Recherche...
                            </span>
                          ) : memberByZk ? (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-100 dark:border-green-800/30 shadow-sm">
                              <CheckCircle className="w-3 h-3" /> {identifiedPerson?.name || memberByZk.nomComplet}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-100 dark:border-red-800/30 shadow-sm">
                              <AlertCircle className="w-3 h-3" /> Membre Introuvable
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="MW-PRI-A8K2Z9 ou Nom..."
                        autoComplete="off"
                        {...register("compte")}
                        onFocus={() => setShowSuggestions(true)}
                        className={`block w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all shadow-sm ${errors.compte
                          ? "border-red-400 ring-4 ring-red-400/10"
                          : "border-slate-100 dark:border-slate-800 focus:border-red-500 ring-0 focus:ring-4 focus:ring-red-500/10"
                          }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {isSearching && (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        )}
                        <Search className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Liste de suggestions */}
                    {showSuggestions && searchResults && searchResults.length > 0 && (
                      <div className="absolute z-60 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchResults.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleSelectMember(member)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                                  {member.nomComplet}
                                </p>
                                <p className="text-[10px] font-mono text-slate-500">
                                  {member.numeroCompte}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-bold text-red-600 uppercase bg-red-600/5 px-2 py-0.5 rounded-full">
                                {member.typeCompte}
                              </span>
                              {member.statut === "actif" && (
                                <div className="flex items-center gap-1 text-[8px] text-green-600 mt-1">
                                  <CheckCircle className="w-2.5 h-2.5" /> Actif
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {errors.compte && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.compte.message}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Date de retrait
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      type="date"
                      {...register("dateOperation", { valueAsDate: true })}
                    />
                    {errors.dateOperation && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.dateOperation.message}
                      </p>
                    )}
                  </div>

                  {/* Montant (Combines Montant + Devise option) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Montant du retrait
                    </label>
                    <div className="relative group">
                      <input
                        className={`block w-full pl-4 pr-20 py-3.5 bg-white dark:bg-slate-800 border-2 rounded-xl text-lg font-black text-slate-900 dark:text-slate-100 focus:outline-none transition-all shadow-sm ${isBalanceInsufficient
                          ? "border-red-500 ring-4 ring-red-500/10"
                          : "border-slate-100 dark:border-slate-800 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                          }`}
                        type="number"
                        min={0}
                        placeholder="0.00"
                        {...register("montant", { valueAsNumber: true })}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                        <select
                          className="h-[calc(100%-12px)] px-3 border-0 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200 text-xs font-black focus:ring-0 cursor-pointer uppercase transition-colors"
                          {...register("devise")}
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Visualisation du solde */}
                    {profileData && (
                      <div className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isBalanceInsufficient
                        ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400"
                        : "bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
                        }`}>
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`w-4 h-4 ${isBalanceInsufficient ? "animate-bounce" : ""}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Solde disponible :</span>
                        </div>
                        <span className="text-sm font-black tabular-nums">
                          {isSoldesFetching ? (
                            <Loader2 className="w-3 h-3 animate-spin inline-block" />
                          ) : (
                            new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(currentSolde || 0)
                          )} {devise}
                        </span>
                      </div>
                    )}

                    {errors.montant && (
                      <p className="text-red-500 text-xs font-medium mt-1">
                        {errors.montant.message}
                      </p>
                    )}
                  </div>

                  {/* Motif / Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                      Motif du retrait
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      type="text"
                      placeholder="Ex: Frais de santé, dépenses..."
                      {...register("description")}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isBalanceInsufficient}
                    className={`px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 group relative overflow-hidden ${isBalanceInsufficient
                      ? "bg-slate-400 cursor-not-allowed shadow-none"
                      : "bg-red-600 shadow-red-600/30 hover:bg-red-700 active:scale-95"
                      }`}
                  >
                    {/* Shimmer Effect */}
                    {!isBalanceInsufficient && !isSubmitting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
                    )}

                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isBalanceInsufficient ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Traitement..." : isBalanceInsufficient ? "Solde Insuffisant" : "Effectuer le retrait"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Validation Admin */}
      <AdminVerificationModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onVerified={onAdminVerified}
        title="Validation Opération de Retrait"
      />
    </>
  );
}
