import { z } from "zod";

/**
 * MemberSchema — Aligné sur le CreateMemberDto du backend NestJS.
 * Champs Prisma : nomComplet, sexe (M/F), idNationale, etc.
 */
export const memberSchema = z.object({
  numeroCompte: z.string().optional(),
  nomComplet: z.string().min(2, "Le nom complet est obligatoire (min. 2 caractères)"),
  dateAdhesion: z.string().min(1, "La date d'adhésion est requise"),
  telephone: z.string()
    .min(1, "Le numéro de téléphone est obligatoire")
    .regex(/^[0-9]{10,15}$/, "Le numéro doit contenir entre 10 et 15 chiffres"),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
  sexe: z.enum(["M", "F"], {
    required_error: "Le genre (sexe) est obligatoire",
    invalid_type_error: "Veuillez sélectionner le genre"
  }),
  typeCompte: z.string().min(1, "Le type de compte est requis"),
  statut: z.enum(["actif", "inactif"]).default("actif"),
  photoProfil: z.string().optional(),
  userId: z.string().optional(),
  motDePasse: z.string()
    .min(4, "Le mot de passe doit contenir au moins 4 caractères")
    .optional()
    .or(z.literal("")),
  dateNaissance: z.string().optional(),
  idNationale: z.string().optional(),
  delegue: z.object({
    nom: z.string().min(1, "Le nom du délégué est requis"),
    telephone: z.string().min(1, "Le téléphone du délégué est requis"),
    relation: z.string().min(1, "La relation est requise"),
    pieceIdentite: z.string().optional().or(z.literal("")),
    userId: z.string().optional(),
    photoProfil: z.string().optional(),
  }).optional(),
});

/**
 * TransactionSchema (Base pour Épargne & Retrait) : Montant (strictement positif, z.coerce.number()), Date, Description
 */
export const transactionSchema = z.object({
  montant: z.coerce.number().positive("Le montant doit être strictement positif"),
  date: z.coerce.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  description: z.string().optional(),
});

/**
 * SavingsSchema (Épargne) : Étend TransactionSchema
 */
export const savingsSchema = transactionSchema.extend({
  numeroCompte: z.string().min(1, "Le numéro de compte est requis"),
  devise: z.enum(["USD", "FC"]).default("FC"),
  biometricValidated: z.boolean().default(false),
});

/**
 * WithdrawalSchema (Retrait) : Étend TransactionSchema - Identique à SavingsSchema pour cohérence UI
 */
export const withdrawalSchema = transactionSchema.extend({
  numeroCompte: z.string().min(1, "Le numéro de compte est requis"),
  devise: z.enum(["USD", "FC"]).default("FC"),
  biometricValidated: z.boolean().default(false),
});

/**
 * LoanSchema (Crédit) : Étend TransactionSchema avec Durée (mois, entier positif) et Taux d'intérêt
 */
export const loanSchema = transactionSchema.extend({
  numeroCompte: z.string().min(1, "Le numéro de compte est requis"),
  devise: z.enum(["USD", "FC"]).default("USD"),
  duree: z.coerce.number().int().positive("La durée doit être un nombre de mois positif"),
  tauxInteret: z.coerce.number().min(0, "Le taux d'intérêt ne peut pas être négatif"),
  biometricValidated: z.boolean().refine(val => val === true, "La validation biométrique est requise"),
  adminPassword: z.string().min(1, "Le mot de passe administrateur est requis"),
});

/**
 * RepaymentSchema (Remboursement) : Étend TransactionSchema
 */
export const repaymentSchema = transactionSchema.extend({
  numeroCompte: z.string().min(1, "Le numéro de compte est requis"),
  pretId: z.string().min(1, "L'ID du prêt est requis"),
  devise: z.enum(["USD", "FC"]).default("FC"),
  biometricValidated: z.boolean().refine(val => val === true, "La validation biométrique est requise"),
  adminPassword: z.string().min(1, "Le mot de passe administrateur est requis"),
});

/**
 * AuthSchema (Connexion)
 */
export const loginSchema = z.object({
  identifier: z.string()
    .min(1, "Veuillez saisir votre email ou numéro de compte")
    .min(3, "L'identifiant est trop court"),
  password: z.string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

/**
 * CashierSchema (Caissier)
 */
export const cashierSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  telephone: z.string().regex(/^[0-9]{10,15}$/, "Format de téléphone local invalide"),
  guichetAssigne: z.string().min(1, "Le guichet est requis"),
  soldeInitial: z.coerce.number().min(0, "Le solde initial ne peut pas être négatif"),
  devise: z.enum(["USD", "FC"]).default("USD"),
  biometricValidated: z.boolean().refine(val => val === true, "La validation biométrique est requise"),
  adminPassword: z.string().min(1, "Le mot de passe administrateur est requis"),
});

/**
 * BalanceSchema (Compte/Solde)
 */
export const balanceSchema = z.object({
  numeroIdentite: z.string().min(1, "Le numéro d'identité du membre est requis"),
  typeCompte: z.enum(["epargne", "credit", "interet"]).default("epargne"),
  devise: z.enum(["USD", "FC"]).default("USD"),
  soldeInitial: z.coerce.number().min(0, "Le solde initial ne peut pas être négatif"),
  biometricValidated: z.boolean().refine(val => val === true, "La validation biométrique est requise"),
  adminPassword: z.string().min(1, "Le mot de passe administrateur est requis"),
});

/**
 * AccountingSchema (Écriture Comptable)
 */
export const accountingSchema = z.object({
  date: z.coerce.date({
    required_error: "La date est requise",
    invalid_type_error: "Format de date invalide",
  }),
  type: z.enum(["expense", "income"]),
  categorie: z.string().min(1, "La catégorie est requise"),
  montant: z.coerce.number().positive("Le montant doit être strictement positif"),
  devise: z.enum(["USD", "FC"]).default("USD"),
  reference: z.string().optional(),
  description: z.string().min(5, "La description doit contenir au moins 5 caractères"),
  biometricValidated: z.boolean().refine(val => val === true, "La validation biométrique est requise"),
  adminPassword: z.string().min(1, "Le mot de passe administrateur est requis"),
});

// Exports des types via z.infer
export type MemberInput = z.infer<typeof memberSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type SavingsInput = z.infer<typeof savingsSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type LoanInput = z.infer<typeof loanSchema>;
export type RepaymentInput = z.infer<typeof repaymentSchema>;
export type CashierInput = z.infer<typeof cashierSchema>;
export type BalanceInput = z.infer<typeof balanceSchema>;
export type AccountingInput = z.infer<typeof accountingSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
