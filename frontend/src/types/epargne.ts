import { Currency } from './common';
import { MemberRecord } from './member';

// Interface pour les transactions de dépôt/retrait (Épargne)
export interface DepositTransaction {
  id: number;
  compte: string;
  typeOperation: 'depot' | 'retrait';
  devise: Currency;
  montant: number;
  dateOperation: string;
  description?: string;
  membre?: MemberRecord;
  createdAt: string;
}

// Interface pour la création d'un dépôt (Payload Front-end)
export interface CreateDepositPayload {
  compte: string;
  montant: number;
  devise: Currency;
  dateOperation: string;
  description?: string;
  biometricValidated?: boolean;
}
