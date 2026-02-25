// types/repayment.ts
import { Currency } from './common';
// Exportation des types
export type RepaymentStatus = 'active' | 'completed' | 'overdue';
// Interface pour les enregistrements de remboursement
export interface RepaymentRecord {
  id: string;
  date: string;
  memberName: string;
  memberInitials: string;
  accountId: string;
  initialAmount: number;
  interestAmount: number;
  totalDue: number;
  paidAmount: number;
  remainingAmount: number;
  progressPercent: number;
  currency: Currency;
  status: RepaymentStatus;
  interestRate: number;
}
// Interface pour la création d'un remboursement
export interface CreateRepaymentPayload {
  accountId: string;
  loanId: string;
  amount: number;
  currency: Currency;
  biometricValidated: boolean;
  adminPassword: string;
}
