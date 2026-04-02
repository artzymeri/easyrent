"use client";

import { useTranslation, Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
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

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>{t("settings.languageDescription")}</CardDescription>
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
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("settings.english")}
                </span>
              </SelectItem>
              <SelectItem value="sq">
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("settings.albanian")}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
