// types/accounting.ts
import { Currency } from './common';
// Exportation des types
export type EntryType = 'income' | 'expense';
export type EntryStatus = 'validated' | 'pending' | 'reconciled';
// Interface pour les entrées comptables
export interface AccountingEntry {
  id: string;
  date: string;
  type: EntryType;
  category: string;
  description: string;
  debit: number;
  credit: number;
  currency: Currency;
  reference: string;
  status: EntryStatus;
  attachments: number;
}
// Interface pour la création d'une entrée comptable
export interface CreateEntryPayload {
  date: string;
  type: EntryType;
  category: string;
  description: string;
  amount: number;
  currency: Currency;
  reference: string;
  biometricValidated: boolean;
  adminPassword: string;
}
