export const CURRENCIES = [
  { value: "FC", label: "Franc Congolais (FC)" },
  { value: "USD", label: "Dollar Américain (USD)" },
] as const;

export type CurrencyValue = (typeof CURRENCIES)[number]["value"];

export const ACCOUNT_TYPES = [
  { value: "PRINCIPAL", label: "Épargne", prefix: "P" },
  { value: "KELASI", label: "Scolaire", prefix: "K" },
  { value: "NYUMBA", label: "Logement", prefix: "N" },
  { value: "HOPITAL", label: "Santé", prefix: "H" },
  { value: "MUTOTO", label: "Junior", prefix: "M" },
  { value: "BIASHARA", label: "Affaires", prefix: "B" },
] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]["value"];
