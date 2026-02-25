"use client";

import { useState } from "react";
import {
  X,
  Fingerprint,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  BookOpen,
  Settings,
  Loader2,
} from "lucide-react";
import { ReportType, CreateReportPayload } from "@/types";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReportPayload) => void | Promise<void>;
}

// Mock user data
const mockUser = {
  name: "Jane Doe",
  initials: "JD",
  role: "Financial Analyst",
};

const reportTypes = [
  { id: "financial", name: "Financier", icon: BarChart3 },
  { id: "audit", name: "Audit", icon: BookOpen },
  { id: "operational", name: "Opérationnel", icon: Settings },
  { id: "compliance", name: "Conformité", icon: CheckCircle },
  { id: "monthly", name: "Mensuel", icon: FileText },
  { id: "annual", name: "Annuel", icon: BarChart3 },
];

const availableSections = [
  { id: "balance", name: "Bilan Comptable" },
  { id: "income", name: "Compte de Résultat" },
  { id: "cashflow", name: "Flux de Trésorerie" },
  { id: "credits", name: "Analyse des Crédits" },
  { id: "savings", name: "Épargne et Dépôts" },
  { id: "members", name: "Activité des Membres" },
  { id: "audit", name: "Rapport d'Audit" },
  { id: "forecast", name: "Prévisions" },
];

export default function CreateReportModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateReportModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateReportPayload>({
    title: "",
    type: "monthly",
    period: "Mars 2024",
    description: "",
    includeSections: ["balance", "income"],
    biometricValidated: false,
    adminPassword: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.adminPassword.length > 0 && formData.title.length > 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        // Reset form
        setFormData({
          title: "",
          type: "monthly",
          period: "Mars 2024",
          description: "",
          includeSections: ["balance", "income"],
          biometricValidated: false,
          adminPassword: "",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setFormData((p) => ({
      ...p,
      includeSections: p.includeSections.includes(sectionId)
        ? p.includeSections.filter((id) => id !== sectionId)
        : [...p.includeSections, sectionId],
    }));
  };

  const canSubmit =
    formData.adminPassword.length > 0 &&
    formData.title.length > 0 &&
    formData.includeSections.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
          {/* Sidebar: Biometric & Security */}
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
                  setFormData((p) => ({
                    ...p,
                    biometricValidated: !p.biometricValidated,
                  }))
                }
                className={`w-full relative cursor-pointer border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${
                  formData.biometricValidated
                    ? "border-green-500/50 bg-green-50 dark:bg-green-900/10 hover:bg-green-100/50"
                    : "border-slate-300 dark:border-slate-600 hover:border-primary/40"
                }`}
              >
                <div className="relative h-20 w-20 flex items-center justify-center">
                  {formData.biometricValidated && (
                    <div className="absolute inset-0 bg-green-500 opacity-20 rounded-full animate-pulse" />
                  )}
                  <Fingerprint
                    className={`w-10 h-10 ${formData.biometricValidated ? "text-green-600" : "text-primary"}`}
                  />
                  {formData.biometricValidated && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`font-semibold text-sm ${formData.biometricValidated ? "text-green-700" : "text-slate-900 dark:text-white"}`}
                  >
                    {formData.biometricValidated
                      ? "Empreinte Validée"
                      : "En attente du scan..."}
                  </p>
                  {formData.biometricValidated && (
                    <p className="text-green-600 text-xs">Match 99.8%</p>
                  )}
                </div>
              </button>

              {/* User Mini Profile */}
              <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {mockUser.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {mockUser.name}
                  </p>
                  <p className="text-xs text-slate-500">{mockUser.role}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-primary font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Analyste Vérifié</span>
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
                  value={formData.adminPassword}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      adminPassword: e.target.value,
                    }))
                  }
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
              <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                <span>Requis pour générer les rapports</span>
              </p>
            </div>
          </div>

          {/* Main Content: Form */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    Nouveau Rapport
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Configurez et générez un nouveau rapport institutionnel.
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Titre du rapport
                  </label>
                  <input
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    type="text"
                    placeholder="Ex: Rapport Financier Mensuel - Mars 2024"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>

                {/* Type & Period */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Type de rapport
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {reportTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              type: type.id as ReportType,
                            }))
                          }
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.type === type.id
                              ? "bg-primary/10 text-primary border border-primary/30"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Période couverte
                    </label>
                    <input
                      className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      type="text"
                      placeholder="Ex: Mars 2024"
                      value={formData.period}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, period: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Sections à inclure
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                          formData.includeSections.includes(section.id)
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {formData.includeSections.includes(section.id) && (
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                        )}
                        {section.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Notes / Description
                  </label>
                  <textarea
                    className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    rows={3}
                    placeholder="Description ou notes spéciales pour ce rapport..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
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
                    disabled={!canSubmit || isSubmitting}
                    className="px-6 py-2.5 bg-primary rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-700 disabled:opacity-60 disabled:hover:bg-primary transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Génération..." : "Générer le Rapport"}
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
