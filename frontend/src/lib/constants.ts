export const CURRENCIES = [
  { value: "FC", label: "Franc Congolais (FC)" },
  { value: "USD", label: "Dollar Américain (USD)" },
] as const;

export type CurrencyValue = (typeof CURRENCIES)[number]["value"];

export const ACCOUNT_TYPES = [
  { value: "PRINCIPAL", label: "PRINCIPAL", prefix: "PRI" },
  { value: "KELASI", label: "KELASI", prefix: "KEL" },
  { value: "NYUMBA", label: "NYUMBA", prefix: "NYU" },
  { value: "HOPITAL", label: "HOPITAL", prefix: "HOP" },
  { value: "MUTOTO", label: "MUTOTO", prefix: "MUT" },
  { value: "BIASHARA", label: "BIASHARA", prefix: "BIA" },
] as const;

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]["value"];
