export const CURRENCIES = [
  { value: "FC", label: "Franc Congolais (FC)" },
  { value: "USD", label: "Dollar Américain (USD)" },
] as const;

export type CurrencyValue = typeof CURRENCIES[number]["value"];
