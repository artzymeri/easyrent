"use client";

import { ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </I18nProvider>
  );
}
