"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Fingerprint, Loader2, Hash, User, Calendar, MapPin, DollarSign, Users, UserPlus, Info, CheckCircle, AlertCircle, Camera, Upload, Trash2 } from "lucide-react";
import { memberSchema, MemberInput } from "@/lib/validations";
import { useGenerateAccountNumber } from "@/hooks/useMembers";
import { useZkTeco } from "@/hooks/useZkTeco";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { BiometricScanner } from "@/components/biometric";

// Composant de téléchargement de photo premium
const PhotoUpload = ({
  label,
  value,
  onChange,
  id
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  id: string
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop lourde (max 2Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="relative group">
        <div className={`w-24 h-24 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden bg-white dark:bg-slate-800 ${value ? "border-primary/50 shadow-lg shadow-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
          }`}>
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in duration-300" />
          ) : (
            <Camera className="w-8 h-8 text-slate-300 group-hover:text-primary/50 transition-colors" />
          )}

          <label
            htmlFor={id}
            className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Upload className="w-6 h-6 text-white" />
          </label>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors active:scale-90"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <input
        type="file"
        id={id}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-[9px] text-slate-400 italic">Clic pour changer</p>
    </div>
  );
};

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
  const [showDelegue, setShowDelegue] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // États pour les photos (base64)
  const [memberPhoto, setMemberPhoto] = useState<string>("");
  const [deleguePhoto, setDeleguePhoto] = useState<string>("");

  const { isScanning, scanStatus, scanError, userId, scanFingerprint } = useZkTeco({ mode: 'registration' });
  const delegueZk = useZkTeco({ mode: 'registration' });

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
      typeCompte: "PRINCIPAL",
      statut: "actif",
      dateAdhesion: new Date().toISOString().split("T")[0],
    },
  });

  const typeCompte = watch("typeCompte");
  const dateAdhesion = watch("dateAdhesion");

  // Synchronisation des photos avec le formulaire
  useEffect(() => {
    setValue("photoProfil", memberPhoto || undefined);
  }, [memberPhoto, setValue]);

  useEffect(() => {
    if (showDelegue) {
      setValue("delegue.photoProfil", deleguePhoto || undefined);
    }
  }, [deleguePhoto, showDelegue, setValue]);

  // Hook pour générer le numéro de compte en temps réel
  const { data: generatedNumero, isLoading: isGenerating } =
    useGenerateAccountNumber(typeCompte, dateAdhesion);

  // Mettre à jour le champ numeroCompte du formulaire quand le backend répond
  useEffect(() => {
    if (generatedNumero && typeof generatedNumero === 'string') {
      setValue("numeroCompte", generatedNumero);
    }
  }, [generatedNumero, setValue]);

  // Synchronisation des IDs biométriques avec le formulaire
  useEffect(() => {
    if (userId) setValue("userId", userId);
  }, [userId, setValue]);

  useEffect(() => {
    if (delegueZk.userId) setValue("delegue.userId", delegueZk.userId);
  }, [delegueZk.userId, setValue]);

  // Empêcher d'avoir le même ID pour le membre et le délégué
  useEffect(() => {
    if (userId && delegueZk.userId && userId === delegueZk.userId) {
      alert("Le membre et le délégué ne peuvent pas avoir la même empreinte !");
      delegueZk.reset();
      setValue("delegue.userId", "");
    }
  }, [userId, delegueZk.userId, delegueZk, setValue]);

  const handleFormSubmit = (data: MemberInput) => {
    // 1. Nettoyer les données (transformer "" en undefined)
    const cleanData = JSON.parse(JSON.stringify(data), (key, value) => {
      return value === "" ? undefined : value;
    });

    // 2. Supprimer l'objet delegue s'il est vide ou si les champs obligatoires manquent
    if (cleanData.delegue) {
      const d = cleanData.delegue;
      if (!d.nom || !d.telephone || !d.relation) {
        delete cleanData.delegue;
      }
    }

    // 3. Envoyer les données propres
    onSubmit(cleanData);

    // Reset et nettoyage local
    reset();
    setMemberPhoto("");
    setDeleguePhoto("");
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
                Complétez tous les champs requis
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
            className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6"
          >
            {/* Section 01: Type de Compte */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  01
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Type de Compte
                </h4>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Sélectionnez le type de compte
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACCOUNT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setValue("typeCompte", type.value, {
                            shouldValidate: true,
                          })
                        }
                        className={`p-2 sm:p-3 rounded-xl border-2 text-left transition-all flex flex-col gap-0.5 ${typeCompte === type.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600"
                          }`}
                      >
                        <span className="text-[10px] font-black leading-none">
                          COOP-{type.prefix}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold uppercase truncate">
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numéro de compte généré */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-primary" />
                    Numéro de compte attribué
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("numeroCompte")}
                      readOnly
                      placeholder="Génération en cours..."
                      className="w-full bg-primary/5 border border-primary/20 rounded-lg text-xs sm:text-sm p-2.5 font-mono font-bold text-primary cursor-default outline-none"
                    />
                    {isGenerating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Ce numéro est généré automatiquement selon la section et l'année.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 02: Identité du Membre */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  02
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Identité du Membre
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <PhotoUpload
                  label="Photo Membre"
                  value={memberPhoto}
                  onChange={setMemberPhoto}
                  id="member-photo-upload"
                />

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        {...register("nomComplet")}
                        placeholder="e.g. Jean Kabila"
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                      />
                      {errors.nomComplet && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.nomComplet.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Téléphone *
                      </label>
                      <input
                        type="text"
                        {...register("telephone")}
                        placeholder="0812345678"
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                      />
                      {errors.telephone && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.telephone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Sexe *
                      </label>
                      <select
                        {...register("sexe")}
                        className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
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
                        Date d'adhésion *
                      </label>
                      <input
                        type="date"
                        {...register("dateAdhesion")}
                        className={`w-full bg-white dark:bg-slate-700 border rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all ${errors.dateAdhesion ? "border-red-500" : "border-slate-200 dark:border-slate-600"}`}
                      />
                      {errors.dateAdhesion && (
                        <p className="text-red-500 text-[10px] mt-1">
                          {errors.dateAdhesion.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 03: Coordonnées & Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  03
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Coordonnées & Plus
                </h4>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Adresse physique
                  </label>
                  <textarea
                    {...register("adresse")}
                    placeholder="Bâtiment, Rue, Quartier, Ville"
                    rows={2}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    ID Nationale / Pièce ID
                  </label>
                  <input
                    type="text"
                    {...register("idNationale")}
                    placeholder="00000000000"
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <button
                  type="button"
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  {showAdvancedOptions ? "- Moins d'options" : "+ Plus d'options (Naissance, Password)"}
                </button>
              </div>

              {showAdvancedOptions && (
                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      {...register("dateNaissance")}
                      className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="email@example.com"
                      className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 04: Biométrie & Finance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  04
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Biométrie & Frais
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <BiometricScanner
                    status={scanStatus}
                    error={scanError}
                    userId={userId}
                    scanning={isScanning}
                    onScan={scanFingerprint}
                    label="Membre Titulaire"
                  />
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase">Frais d'Adhésion</span>
                  </div>
                  <p className="text-[10px] text-orange-700 dark:text-orange-400 mb-3 leading-tight">
                    Une cotisation de 2 000 FC sera déduite pour le compte collectif.
                  </p>
                  <div className="text-2xl font-black text-orange-600">2 000 FC</div>
                </div>
              </div>
            </div>

            {/* Section 05: Délégué */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                  05
                </span>
                <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wide text-slate-700">
                  Délégué (Optionnel)
                </h4>
              </div>

              {!showDelegue ? (
                <button
                  type="button"
                  onClick={() => setShowDelegue(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <UserPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Ajouter un délégué autorisé</span>
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col sm:flex-row gap-6 items-start bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <PhotoUpload
                      label="Photo Délégué"
                      value={deleguePhoto}
                      onChange={setDeleguePhoto}
                      id="delegue-photo-upload"
                    />

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">
                              Nom du délégué *
                            </label>
                            <input
                              type="text"
                              {...register("delegue.nom")}
                              placeholder="Nom Complet"
                              className={`w-full bg-white dark:bg-slate-700 border rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all ${errors.delegue?.nom ? "border-red-500" : "border-slate-200 dark:border-slate-600"}`}
                            />
                            {errors.delegue?.nom && (
                              <p className="text-red-500 text-[10px] mt-1">
                                {errors.delegue.nom.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">
                              Relation *
                            </label>
                            <select
                              {...register("delegue.relation")}
                              className={`w-full bg-white dark:bg-slate-700 border rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all ${errors.delegue?.relation ? "border-red-500" : "border-slate-200 dark:border-slate-600"}`}
                            >
                              <option value="">Sélectionner</option>
                              <option value="Conjoint(e)">Conjoint(e)</option>
                              <option value="Enfant">Enfant</option>
                              <option value="Frère/Sœur">Frère/Sœur</option>
                              <option value="Parent">Parent</option>
                              <option value="Cousin(e)">Cousin(e)</option>
                              <option value="Autre">Autre</option>
                            </select>
                            {errors.delegue?.relation && (
                              <p className="text-red-500 text-[10px] mt-1">
                                {errors.delegue.relation.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">
                              Téléphone
                            </label>
                            <input
                              type="text"
                              {...register("delegue.telephone")}
                              placeholder="0812345678"
                              className={`w-full bg-white dark:bg-slate-700 border rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all ${errors.delegue?.telephone ? "border-red-500" : "border-slate-200 dark:border-slate-600"}`}
                            />
                            {errors.delegue?.telephone && (
                              <p className="text-red-500 text-[10px] mt-1">
                                {errors.delegue.telephone.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">
                              Pièce ID
                            </label>
                            <input
                              type="text"
                              {...register("delegue.pieceIdentite")}
                              placeholder="N° Carte / Passport"
                              className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs sm:text-sm p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <BiometricScanner
                        status={delegueZk.scanStatus}
                        error={delegueZk.scanError}
                        userId={delegueZk.userId}
                        scanning={delegueZk.isScanning}
                        onScan={delegueZk.scanFingerprint}
                        label="Délégué"
                      />

                      <div className="flex items-center justify-center p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDelegue(false);
                            setDeleguePhoto("");
                          }}
                          className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Annuler le délégué
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </form>

          {/* Footer - Fixed Bottom */}
          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 sm:py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="create-member-form" // On lie au bouton si nécéssaire, ou on garde handleSubmit
              onClick={handleSubmit(handleFormSubmit)} // Déclenchement manuel si hors scope form
              disabled={isSubmitting}
              className="py-2.5 sm:py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:hover:bg-primary text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Création..." : "Enregistrer Membre"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
