// types/settings.ts
import { Currency } from './common';
// Exportation des types
export interface CooperativeSettings {
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  foundedDate: string;
  currency: Currency;
  fiscalYearStart: string;
}
// Interface pour les paramètres financiers
export interface FinancialSettings {
  defaultInterestRate: number;
  maxLoanAmount: number;
  minLoanAmount: number;
  savingsInterestRate: number;
  latePaymentPenalty: number;
  processingFee: number;
}
// Interface pour les paramètres de sécurité
export interface SecuritySettings {
  requireBiometric: boolean;
  requireAdminApproval: boolean;
  adminApprovalThreshold: number;
  sessionTimeout: number;
  passwordExpiryDays: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  paymentReminders: boolean;
  overdueAlerts: boolean;
  reportGeneration: boolean;
}
