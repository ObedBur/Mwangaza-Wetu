"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Fingerprint, Loader2 } from "lucide-react";
import { memberSchema, MemberInput } from "@/lib/validations";

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberInput) => void | Promise<void>;
}

export default function CreateMemberModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateMemberModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      nomComplet: "",
      email: "",
      telephone: "",
      adresse: "",
      idNationale: "",
      sexe: undefined,
      typeCompte: "Epargne",
      statut: "actif",
      dateAdhesion: new Date().toISOString().split("T")[0],
    },
  });

  const typeCompte = watch("typeCompte");

  const handleFormSubmit = (data: MemberInput) => {
    onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel - Centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-primary/5 sticky top-0 z-10">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                Nouveau Membre
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Completez tous les champs requis
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 shrink-0 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6 sm:space-y-8"
          >
            {/* Section 1: Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  01
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Détails de l&apos;identité
                </h4>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    {...register("nomComplet")}
                    placeholder="e.g. Jean Kabila"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                  />
                  {errors.nomComplet && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.nomComplet.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Email (Optionnel)
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="jean@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      ID Nationale
                    </label>
                    <input
                      type="text"
                      {...register("idNationale")}
                      placeholder="00000000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                    />
                    {errors.idNationale && (
                      <p className="text-red-500 text-[10px] mt-1">
                        {errors.idNationale.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      {...register("telephone")}
                      placeholder="0812345678"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                    />
                    {errors.telephone && (
                      <p className="text-red-500 text-[10px] mt-1">
                        {errors.telephone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Sexe
                  </label>
                  <select
                    {...register("sexe")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner</option>
                    <option value="F">Féminin</option>
                    <option value="M">Masculin</option>
                  </select>
                  {errors.sexe && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.sexe.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Date d&apos;adhésion
                  </label>
                  <input
                    type="date"
                    {...register("dateAdhesion")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                  />
                  {errors.dateAdhesion && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.dateAdhesion.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Security & Biometrics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  02
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Inscription de Sécurité
                </h4>
              </div>
              <div className="p-4 sm:p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 dark:border-primary/20 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary bg-white dark:bg-slate-800 shadow-inner">
                    <Fingerprint className="w-8 sm:w-10 h-8 sm:h-10 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1 w-full">
                  <label className="text-xs font-semibold text-slate-600">
                    Adresse Physique
                  </label>
                  <textarea
                    {...register("adresse")}
                    placeholder="Bâtiment, Rue, Quartier"
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all resize-none"
                  />
                  {errors.adresse && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.adresse.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Account Setup */}
            <div className="space-y-4 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  03
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Configuration du Compte
                </h4>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Type de Compte
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Epargne", "Courant", "Credit"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setValue("typeCompte", type, {
                            shouldValidate: true,
                          })
                        }
                        className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all text-[10px] sm:text-xs font-bold uppercase ${
                          typeCompte === type
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {errors.typeCompte && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.typeCompte.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="py-2 sm:py-3 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 min-h-[44px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 sm:py-3 px-3 sm:px-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:hover:bg-primary text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 min-h-[44px] flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Création..." : "Créer Membre"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
