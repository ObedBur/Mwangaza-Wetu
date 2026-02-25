import { Currency } from './common';

export type CashierStatus = 'active' | 'inactive' | 'suspended';
export type ShiftStatus = 'open' | 'closed' | 'balanced';

export interface Cashier {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: CashierStatus;
  assignedWindow: string;
  shiftStatus: ShiftStatus;
  openDate: string;
  balance: number;
  currency: Currency;
  todayTransactions: number;
  totalAmount: number;
}

export interface CreateCashierPayload {
  name: string;
  email: string;
  phone: string;
  assignedWindow: string;
  initialBalance: number;
  currency: Currency;
  biometricValidated: boolean;
  adminPassword: string;
}
