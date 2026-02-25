// types/balance.ts
import { Currency } from './common';
// Exportation des types
export type BalanceType = 'epargne' | 'credit' | 'retrait' | 'remboursement' | 'interet';
export type BalanceStatus = 'active' | 'closed' | 'frozen';
// Interface pour le solde total
export interface AccountBalance {
  id: string;
  memberId: string;
  memberName: string;
  initials: string;
  accountType: BalanceType;
  currency: Currency;
  balanceUSD: number;
  balanceFC: number;
  totalDeposits: number;
  totalWithdrawals: number;
  status: BalanceStatus;
  lastTransaction: string;
  openedDate: string;
}
// Interface pour la création d'un solde
export interface CreateBalancePayload {
  memberId: string;
  accountType: BalanceType;
  currency: Currency;
  initialDeposit: number;
}
