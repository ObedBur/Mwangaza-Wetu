"use client";

import {
  Percent,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { FinancialSettings } from "@/types";

interface FinancialSettingsSectionProps {
  settings: FinancialSettings;
  onChange: (settings: FinancialSettings) => void;
}

export default function FinancialSettingsSection({
  settings,
  onChange,
}: FinancialSettingsSectionProps) {
  const handleChange = (field: keyof FinancialSettings, value: number) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Paramètres Financiers
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configuration des taux et limites
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Percent className="w-4 h-4 inline mr-1" />
              Taux d&apos;intérêt par défaut (%)
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.defaultInterestRate}
                onChange={(e) =>
                  handleChange("defaultInterestRate", Number(e.target.value))
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                %
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Taux appliqué aux nouveaux crédits
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <PiggyBank className="w-4 h-4 inline mr-1" />
              Taux intérêt épargne (%)
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={settings.savingsInterestRate}
                onChange={(e) =>
                  handleChange("savingsInterestRate", Number(e.target.value))
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                %
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Rémunération des comptes épargne
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Montant minimum de crédit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                $
              </span>
              <input
                className="block w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                min="0"
                value={settings.minLoanAmount}
                onChange={(e) =>
                  handleChange("minLoanAmount", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Montant maximum de crédit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                $
              </span>
              <input
                className="block w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                min="0"
                value={settings.maxLoanAmount}
                onChange={(e) =>
                  handleChange("maxLoanAmount", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
              Pénalité retard (%)
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={settings.latePaymentPenalty}
                onChange={(e) =>
                  handleChange("latePaymentPenalty", Number(e.target.value))
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                %
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <Receipt className="w-4 h-4 inline mr-1" />
              Frais de traitement (%)
            </label>
            <div className="relative">
              <input
                className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={settings.processingFee}
                onChange={(e) =>
                  handleChange("processingFee", Number(e.target.value))
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
