"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, Search, User, CheckCircle } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { savingsSchema, SavingsInput } from "@/lib/validations";
import { CURRENCIES } from "@/lib/constants";
import { useZkTeco } from "@/hooks/useZkTeco";
import { BiometricScanner } from "@/components/biometric";
import { useMemberByZkId, useMemberSearch } from "@/hooks/useMembers";
import { MemberRecord } from "@/types";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [identifiedPerson, setIdentifiedPerson] = useState<{ name: string; role: 'Membre' | 'Délégué' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SavingsInput>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      numeroCompte: "",
      devise: "FC",
      date: new Date(),
      montant: 0,
      biometricValidated: false,
    },
  });

  const devise = watch("devise");
  const numeroCompte = watch("numeroCompte");

  // ─── Recherche de membre par query (Autocomplete) ─────────────────────
  const { data: searchResults, isFetching: isSearching } = useMemberSearch(
    numeroCompte,
    { enabled: showSuggestions }
  );

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
        setValue("numeroCompte", memberByZk.numeroCompte, { shouldValidate: true });
      }

      // Identifier si c'est le membre ou l'un de ses délégués
      if (String(memberByZk.userId) === String(biometricUserId)) {
        setIdentifiedPerson({ name: memberByZk.nomComplet, role: 'Membre' });
      } else if (memberByZk.delegues && memberByZk.delegues.length > 0) {
        const matchingDelegue = memberByZk.delegues.find(d => String(d.userId) === String(biometricUserId));
        if (matchingDelegue) {
          setIdentifiedPerson({ name: matchingDelegue.nom, role: 'Délégué' });
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        numeroCompte: "",
        devise: "FC",
        date: new Date(),
        montant: 0,
        biometricValidated: false,
      });
      resetBiometric();
      setShowSuggestions(false);
    }
  }, [isOpen, reset, resetBiometric]);

  const handleSelectMember = (member: MemberRecord) => {
    setValue("numeroCompte", member.numeroCompte, { shouldValidate: true });
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-slate-900">
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
            {/* Champ Numéro de Compte avec Autocomplete */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Numéro de Compte
                {isFetchingByZk && (
                  <span className="flex items-center gap-1 text-[10px] text-primary italic animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Identification...
                  </span>
                )}
              </label>

              {/* Affichage de la personne identifiée par biométrie */}
              {identifiedPerson && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">
                      Scanné par : <span className="underline">{identifiedPerson.role}</span>
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {identifiedPerson.name}
                    </p>
                  </div>
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="COOP-P-2026-0001 ou Nom..."
                  autoComplete="off"
                  {...register("numeroCompte")}
                  onFocus={() => setShowSuggestions(true)}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border rounded-xl focus:ring-2 transition-all font-semibold ${errors.numeroCompte
                    ? "border-red-500 focus:ring-red-500/20 text-red-900"
                    : "border-slate-200 dark:border-slate-700 focus:ring-primary/20"
                    }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isSearching && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                  <Search className="w-4 h-4 text-slate-300" />
                </div>
              </div>

              {/* Liste de suggestions */}
              {showSuggestions && searchResults && searchResults.length > 0 && (
                <div className="absolute z-[60] left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleSelectMember(member)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
                        <span className="text-[9px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-full">
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
              {errors.numeroCompte && (
                <p className="text-red-500 text-xs mt-1 font-medium italic">
                  {errors.numeroCompte.message}
                </p>
              )}
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

            {/* Scanner biométrique partagé */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Validation Biométrique
              </label>
              <BiometricScanner
                label="Dépôt"
                status={biometricStatus}
                error={biometricError}
                userId={biometricUserId}
                scanning={isBiometricPending}
                onScan={triggerScan}
              />
              {errors.biometricValidated && (
                <p className="text-red-500 text-xs mt-1 text-center font-medium">
                  {errors.biometricValidated.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:hover:bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
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
