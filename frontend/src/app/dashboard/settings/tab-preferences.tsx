"use client";

import { useTranslation, Locale } from "@/lib/i18n";
import { useCurrency, CURRENCIES } from "@/lib/currency-context";
import { api } from "@/lib/api";
import { Globe, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TabPreferencesProps {
  isManager: boolean;
}

export function TabPreferences({ isManager }: TabPreferencesProps) {
  const { t, locale, setLocale } = useTranslation();
  const { currency, setCurrencyCode } = useCurrency();

  const handleCurrencyChange = async (code: string | null) => {
    if (!code) return;
    try {
      await api.put("/settings", { currency: code });
      setCurrencyCode(code);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.failedSave"));
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("settings.language")}
          </CardTitle>
          <CardDescription>
            {t("settings.languageDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={locale}
            onValueChange={(val) => {
              if (val) {
                setLocale(val as Locale);
                toast.success(t("settings.saved"));
              }
            }}
          >
            <SelectTrigger className="w-72">
              <SelectValue
                placeholder={
                  locale === "sq"
                    ? t("settings.albanian")
                    : t("settings.english")
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <span className="flex items-center gap-2">
                  {t("settings.english")}
                </span>
              </SelectItem>
              <SelectItem value="sq">
                <span className="flex items-center gap-2">
                  {t("settings.albanian")}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Currency */}
      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t("settings.currency")}
            </CardTitle>
            <CardDescription>
              {t("settings.currencyDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={currency.code}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-72">
                <SelectValue
                  placeholder={`${currency.symbol} ${currency.name} (${currency.code})`}
                />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="w-8 font-mono text-muted-foreground">
                        {c.symbol}
                      </span>
                      {c.name} ({c.code})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
