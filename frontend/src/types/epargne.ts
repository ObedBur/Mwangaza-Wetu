// types/epargne.ts
import { Currency, RunningTotal } from './common';
// Interface pour les transactions de dépôt
export interface DepositTransaction {
  id: string;
  memberName: string;
  accountNumber: string;
  amount: number;
  currency: Currency;
  dateISO: string;
  time: string;
  runningTotal: RunningTotal;
}
// Interface pour la création d'un dépôt
export interface CreateDepositPayload {
  memberId: string;
  amount: number;
  currency: Currency;
  sourceOfFunds?: string;
  biometricValidated?: boolean;
}
