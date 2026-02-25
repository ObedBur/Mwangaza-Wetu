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
  Upload,
  Calculator,
  Loader2,
} from "lucide-react";
import { accountingSchema, AccountingInput } from "@/lib/validations";

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountingInput) => void | Promise<void>;
}

// Mock user data
const mockUser = {
  name: "Jane Doe",
  initials: "JD",
  role: "Chief Accountant",
};

const categories = [
  { id: "salaries", name: "Salaries" },
  { id: "loan-interest", name: "Loan Interest" },
  { id: "office", name: "Office Supplies" },
  { id: "membership", name: "Membership Fees" },
  { id: "utilities", name: "Utilities" },
  { id: "savings-int", name: "Savings Interest" },
  { id: "maintenance", name: "Maintenance" },
  { id: "loan-principal", name: "Loan Principal" },
];

export default function CreateEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEntryModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountingInput>({
    resolver: zodResolver(accountingSchema),
    defaultValues: {
      date: new Date(),
      type: "expense",
      categorie: "office",
      description: "",
      montant: 0,
      devise: "USD",
      reference: "",
      biometricValidated: false,
      adminPassword: "",
    },
  });

  const watchType = watch("type");
  const biometricValidated = watch("biometricValidated");
  const dateValue = watch("date");

  if (!isOpen) return null;

  const handleFormSubmit = (data: AccountingInput) => {
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
          {/* Sidebar: Biometric & Security */}
          <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-6 justify-between overflow-y-auto shrink-0">
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
                    className={`shrink-0 w-10 h-10 ${biometricValidated ? "text-green-600" : "text-primary"}`}
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

              {/* User Mini Profile */}
              <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {mockUser.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {mockUser.name}
                  </p>
                  <p className="text-xs text-slate-500">{mockUser.role}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <CheckCircle className="shrink-0 w-3 h-3" />
                    <span>Comptable Vérifié</span>
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
                  <Lock className="shrink-0 text-slate-400 w-4 h-4" />
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
              <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                <span>Requis pour toutes écritures</span>
              </p>
            </div>
          </div>

          {/* Main Content: Form */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Nouvel Écrit Comptable
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Veuillez remplir les informations de l&apos;écriture
                    ci-dessous.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                {/* Entry Type Toggle */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit shrink-0">
                  <button
                    type="button"
                    onClick={() => setValue("type", "expense")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      watchType === "expense"
                        ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Dépense (Crédit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("type", "income")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      watchType === "income"
                        ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    Revenu (Débit)
                  </button>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 shrink-0">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Date de l&apos;écriture
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      type="date"
                      {...register("date", {
                        valueAsDate: true,
                        setValueAs: (v) => (v ? new Date(v) : undefined),
                      })}
                      defaultValue={
                        dateValue instanceof Date
                          ? dateValue.toISOString().split("T")[0]
                          : ""
                      }
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Catégorie
                    </label>
                    <div className="relative">
                      <select
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                        {...register("categorie")}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.categorie && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.categorie.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Montant
                    </label>
                    <div className="relative">
                      <input
                        className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        type="number"
                        min="0"
                        step="0.01"
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

                  {/* Reference */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Référence / N° Pièce
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      type="text"
                      placeholder="Ex: INV-2024-001"
                      {...register("reference")}
                    />
                    {errors.reference && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.reference.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="shrink-0">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Description détaillée de l'écriture..."
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Attachments */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors cursor-pointer shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Upload className="shrink-0 w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                    Ajouter des pièces justificatives
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG (max 10MB)
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
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
                      <Loader2 className="shrink-0 w-4 h-4 animate-spin" />
                    ) : (
                      <Calculator className="shrink-0 w-4 h-4" />
                    )}
                    {isSubmitting
                      ? "Enregistrement..."
                      : "Enregistrer l'écriture"}
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
