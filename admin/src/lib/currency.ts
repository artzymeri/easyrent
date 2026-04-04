// ── Currency metadata ─────────────────────────────────────────
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  position: "before" | "after";
  decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "EUR", symbol: "€",   name: "Euro",                    position: "before", decimals: 2 },
  { code: "USD", symbol: "$",   name: "US Dollar",               position: "before", decimals: 2 },
  { code: "GBP", symbol: "£",   name: "British Pound",           position: "before", decimals: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc",             position: "before", decimals: 2 },
  { code: "ALL", symbol: "L",   name: "Albanian Lek",            position: "after",  decimals: 0 },
  { code: "RSD", symbol: "din", name: "Serbian Dinar",           position: "after",  decimals: 0 },
  { code: "MKD", symbol: "ден", name: "Macedonian Denar",        position: "after",  decimals: 0 },
  { code: "BAM", symbol: "KM",  name: "Bosnia Convertible Mark", position: "after",  decimals: 2 },
  { code: "TRY", symbol: "₺",   name: "Turkish Lira",            position: "before", decimals: 2 },
  { code: "SEK", symbol: "kr",  name: "Swedish Krona",           position: "after",  decimals: 2 },
  { code: "NOK", symbol: "kr",  name: "Norwegian Krone",         position: "after",  decimals: 2 },
  { code: "DKK", symbol: "kr",  name: "Danish Krone",            position: "after",  decimals: 2 },
  { code: "PLN", symbol: "zł",  name: "Polish Zloty",            position: "after",  decimals: 2 },
  { code: "CZK", symbol: "Kč",  name: "Czech Koruna",            position: "after",  decimals: 2 },
  { code: "HUF", symbol: "Ft",  name: "Hungarian Forint",        position: "after",  decimals: 0 },
  { code: "RON", symbol: "lei", name: "Romanian Leu",            position: "after",  decimals: 2 },
  { code: "BGN", symbol: "лв",  name: "Bulgarian Lev",           position: "after",  decimals: 2 },
  { code: "HRK", symbol: "kn",  name: "Croatian Kuna",           position: "after",  decimals: 2 },
  { code: "CAD", symbol: "C$",  name: "Canadian Dollar",         position: "before", decimals: 2 },
  { code: "AUD", symbol: "A$",  name: "Australian Dollar",       position: "before", decimals: 2 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham",              position: "after",  decimals: 2 },
];

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currencyCode: string = "EUR",
): string {
  if (amount == null || amount === "") return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";

  const info = getCurrencyInfo(currencyCode);
  const formatted = num.toFixed(info.decimals);
  if (info.position === "before") {
    return `${info.symbol}${formatted}`;
  }
  return `${formatted} ${info.symbol}`;
}
