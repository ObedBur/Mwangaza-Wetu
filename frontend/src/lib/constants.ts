export const CURRENCIES = [
  { value: "FC", label: "Franc Congolais (FC)" },
  { value: "USD", label: "Dollar Américain (USD)" },
] as const;

export type CurrencyValue = (typeof CURRENCIES)[number]["value"];

export const ACCOUNT_TYPES = [
  { value: "PRINCIPAL", label: "Épargne", prefix: "PRI" },
  { value: "KELASI", label: "Scolaire", prefix: "KEL" },
  { value: "NYUMBA", label: "Logement", prefix: "NYU" },
  { value: "HOPITAL", label: "Santé", prefix: "HOP" },
  { value: "MUTOTO", label: "Junior", prefix: "MUT" },
  { value: "BIASHARA", label: "Affaires", prefix: "BIA" },
] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]["value"];
