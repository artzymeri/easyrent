const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  ALL: "Lek",
  CHF: "CHF",
};

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${Number(amount).toFixed(0)}`;
}
