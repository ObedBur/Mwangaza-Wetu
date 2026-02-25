"use client";

import { useState } from "react";
import ParametresHeader from "@/components/parametres/ParametresHeader";
import CooperativeSettingsSection from "@/components/parametres/CooperativeSettingsSection";
import FinancialSettingsSection from "@/components/parametres/FinancialSettingsSection";
import SecuritySettingsSection from "@/components/parametres/SecuritySettingsSection";
import NotificationSettingsSection from "@/components/parametres/NotificationSettingsSection";
import {
  CooperativeSettings,
  FinancialSettings,
  SecuritySettings,
  NotificationSettings,
} from "@/types";
const DEFAULT_COOP_SETTINGS: CooperativeSettings = {
  name: "Mwangaza Wetu",
  legalName: "Coopérative Mwangaza Wetu",
  taxId: "00000",
  address: "",
  phone: "",
  email: "contact@mwangazawetu.cd",
  website: "",
  foundedDate: "2020-01-01",
  currency: "USD",
  fiscalYearStart: "01-01",
};

const DEFAULT_FIN_SETTINGS: FinancialSettings = {
  defaultInterestRate: 5,
  maxLoanAmount: 10000,
  minLoanAmount: 50,
  savingsInterestRate: 2,
  latePaymentPenalty: 1,
  processingFee: 10,
};

const DEFAULT_SEC_SETTINGS: SecuritySettings = {
  requireBiometric: true,
  requireAdminApproval: true,
  adminApprovalThreshold: 1000,
  sessionTimeout: 15,
  passwordExpiryDays: 90,
};

const DEFAULT_NOTIF_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: true,
  paymentReminders: true,
  overdueAlerts: true,
  reportGeneration: true,
};

/**
 * Page de paramètres de la plateforme.
 * Allégée de la logique de layout globale.
 */
export default function ParametresPage() {
  const [cooperativeSettings, setCooperativeSettings] =
    useState<CooperativeSettings>(DEFAULT_COOP_SETTINGS);
  const [financialSettings, setFinancialSettings] =
    useState<FinancialSettings>(DEFAULT_FIN_SETTINGS);
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettings>(DEFAULT_SEC_SETTINGS);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(DEFAULT_NOTIF_SETTINGS);

  const handleSave = () => {
    console.log("Saving settings:", {
      cooperative: cooperativeSettings,
      financial: financialSettings,
      security: securitySettings,
      notifications: notificationSettings,
    });
    alert("Paramètres enregistrés avec succès !");
  };

  const handleReset = () => {
    setCooperativeSettings(DEFAULT_COOP_SETTINGS);
    setFinancialSettings(DEFAULT_FIN_SETTINGS);
    setSecuritySettings(DEFAULT_SEC_SETTINGS);
    setNotificationSettings(DEFAULT_NOTIF_SETTINGS);
  };

  return (
    <div className="space-y-8">
      <ParametresHeader onSave={handleSave} onReset={handleReset} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CooperativeSettingsSection
          settings={cooperativeSettings}
          onChange={setCooperativeSettings}
        />
        <FinancialSettingsSection
          settings={financialSettings}
          onChange={setFinancialSettings}
        />
        <SecuritySettingsSection
          settings={securitySettings}
          onChange={setSecuritySettings}
        />
        <NotificationSettingsSection
          settings={notificationSettings}
          onChange={setNotificationSettings}
        />
      </div>
    </div>
  );
}
