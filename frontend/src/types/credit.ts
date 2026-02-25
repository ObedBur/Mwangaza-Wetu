import { Currency } from './common';

export type CreditStatus = 'pending' | 'active' | 'overdue' | 'completed';

export interface CreditRecord {
  id: string;
  memberName: string;
  memberRole: string;
  initials: string;
  amount: number;
  remainingAmount: number;
  currency: Currency;
  startDate: string;
  interestRate: number;
  durationMonths: number;
  status: CreditStatus;
}

export interface CreateCreditPayload {
  accountId: string;
  amount: number;
  currency: Currency;
  interestRate: number;
  durationMonths: number;
  startDate: string;
  biometricValidated: boolean;
  adminPassword: string;
}
