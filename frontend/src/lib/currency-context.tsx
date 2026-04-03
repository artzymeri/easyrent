"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api } from "./api";

// ── Currency metadata ─────────────────────────────────────────
export interface CurrencyInfo {
  code: string;   // ISO 4217  e.g. "EUR"
  symbol: string; // e.g. "€"
  name: string;   // e.g. "Euro"
  position: "before" | "after"; // symbol placement
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
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]; // fallback EUR
}

// ── Format helpers ────────────────────────────────────────────
export function formatCurrencyValue(
  amount: number | string | null | undefined,
  currency: CurrencyInfo,
): string {
  if (amount == null || amount === "") return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "—";

  const formatted = num.toFixed(currency.decimals);
  if (currency.position === "before") {
    return `${currency.symbol}${formatted}`;
  }
  return `${formatted} ${currency.symbol}`;
}

// ── Context ───────────────────────────────────────────────────
interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrencyCode: (code: string) => void;
  /** Format an amount with the company's currency symbol */
  fc: (amount: number | string | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(getCurrencyInfo("EUR"));

  useEffect(() => {
    // Only fetch if logged in
    const token = localStorage.getItem("staff_token");
    if (!token) return;

    api
      .get<{ currency: string }>("/settings")
      .then((data) => {
        setCurrency(getCurrencyInfo(data.currency));
      })
      .catch(() => {
        // Silently use default (EUR) if not logged in or error
      });
  }, []);

  const setCurrencyCode = useCallback((code: string) => {
    setCurrency(getCurrencyInfo(code));
  }, []);

  const fc = useCallback(
    (amount: number | string | null | undefined) =>
      formatCurrencyValue(amount, currency),
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, fc }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
