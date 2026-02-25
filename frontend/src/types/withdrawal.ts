// 
import { Currency } from './common';
// 
export type WithdrawalStatus = 'completed' | 'pending' | 'cancelled';

export interface WithdrawalTransaction {
  id: string;
  dateISO: string;
  time: string;
  accountNumber: string;
  memberName: string;
  amount: number;
  currency: Currency;
  amountUSD?: number;
  reason: string;
  status: WithdrawalStatus;
}
// 
export interface CreateWithdrawalPayload {
  accountId?: string;
  accountNumber: string;
  amount: number;
  currency: Currency;
  dateISO: string;
  reason: string;
  biometricValidated: boolean;
  adminPassword: string;
}

