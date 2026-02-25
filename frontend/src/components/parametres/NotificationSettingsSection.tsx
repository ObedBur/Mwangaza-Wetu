"use client";

import {
  Bell,
  Mail,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  FileText,
  CheckCircle,
} from "lucide-react";
import { NotificationSettings } from "@/types";

interface NotificationSettingsSectionProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
}

export default function NotificationSettingsSection({
  settings,
  onChange,
}: NotificationSettingsSectionProps) {
  const handleToggle = (field: keyof NotificationSettings) => {
    onChange({ ...settings, [field]: !settings[field] });
  };

  const notificationOptions = [
    {
      field: "emailNotifications" as const,
      icon: Mail,
      title: "Notifications email",
      description: "Recevoir les alertes par email",
      color: "blue",
    },
    {
      field: "smsNotifications" as const,
      icon: MessageSquare,
      title: "Notifications SMS",
      description: "Recevoir les alertes par SMS",
      color: "green",
    },
    {
      field: "paymentReminders" as const,
      icon: CreditCard,
      title: "Rappels de paiement",
      description: "Alerter les membres des échéances",
      color: "amber",
    },
    {
      field: "overdueAlerts" as const,
      icon: AlertTriangle,
      title: "Alertes de retard",
      description: "Notifier en cas de paiement en retard",
      color: "red",
    },
    {
      field: "reportGeneration" as const,
      icon: FileText,
      title: "Génération de rapports",
      description: "Notifier lors de la création de rapports",
      color: "indigo",
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    indigo:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configuration des alertes et notifications
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {notificationOptions.map((option) => (
          <div
            key={option.field}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses[option.color]}`}>
                <option.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {option.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(option.field)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings[option.field]
                  ? "bg-primary"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings[option.field] ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}

        {/* Test Notification Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Envoyer une notification test
          </button>
        </div>
      </div>
    </section>
  );
}
