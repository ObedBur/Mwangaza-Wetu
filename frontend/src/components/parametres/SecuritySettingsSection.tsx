"use client";

import { Fingerprint, Lock, Clock, Shield, UserCheck } from "lucide-react";
import { SecuritySettings } from "@/types";

interface SecuritySettingsSectionProps {
  settings: SecuritySettings;
  onChange: (settings: SecuritySettings) => void;
}

export default function SecuritySettingsSection({
  settings,
  onChange,
}: SecuritySettingsSectionProps) {
  const handleToggle = (field: keyof SecuritySettings) => {
    onChange({ ...settings, [field]: !settings[field] });
  };

  const handleNumberChange = (field: keyof SecuritySettings, value: number) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sécurité
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configuration de la sécurité et authentification
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Toggle Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Vérification biométrique
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exiger l&apos;authentification par empreinte
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("requireBiometric")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireBiometric
                  ? "bg-primary"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireBiometric ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Validation administrateur
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Requise pour les opérations sensibles
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("requireAdminApproval")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.requireAdminApproval
                  ? "bg-primary"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.requireAdminApproval
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Numeric Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Lock className="w-4 h-4 inline mr-1" />
              Seuil validation admin ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                $
              </span>
              <input
                className="block w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                min="0"
                value={settings.adminApprovalThreshold}
                onChange={(e) =>
                  handleNumberChange(
                    "adminApprovalThreshold",
                    Number(e.target.value),
                  )
                }
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Montant minimum pour validation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" />
              Expiration session (min)
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                min="5"
                max="120"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleNumberChange("sessionTimeout", Number(e.target.value))
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                min
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Délai d&apos;inactivité avant déconnexion
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Expiration mot de passe (jours)
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                min="30"
                max="365"
                value={settings.passwordExpiryDays}
                onChange={(e) =>
                  handleNumberChange(
                    "passwordExpiryDays",
                    Number(e.target.value),
                  )
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                jours
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Durée de validité des mots de passe
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
