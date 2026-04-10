"use client";

import { useTranslation } from "@/lib/i18n";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Printer,
  IdCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { CompanyInfoFieldsProps } from "./company-types";

export function CompanyInfoFields({
  company,
  form,
  updateField,
}: CompanyInfoFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("settings.companyInfo")}
          </CardTitle>
          <CardDescription>
            {t("settings.companyInfoDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Read-only fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                {t("settings.companyName")}
              </Label>
              <Input value={company.name} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                {t("settings.subdomain")}
              </Label>
              <Input value={company.subdomain} disabled className="bg-muted" />
            </div>
          </div>

          <Separator />

          {/* Editable contact fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {t("settings.companyEmail")}
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder={t("settings.emailPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {t("settings.companyPhone")}
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder={t("settings.phonePlaceholder")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {t("settings.address")}
              </Label>
              <Input
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder={t("settings.addressPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.city")}</Label>
              <Input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder={t("settings.cityPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.country")}</Label>
              <Input
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder={t("settings.countryPlaceholder")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            {t("settings.businessInfo")}
          </CardTitle>
          <CardDescription>
            {t("settings.businessInfoDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {t("settings.businessNumber")}
              </Label>
              <Input
                value={form.businessNumber}
                onChange={(e) => updateField("businessNumber", e.target.value)}
                placeholder={t("settings.businessNumberPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5" />
                {t("settings.businessFaxNumber")}
              </Label>
              <Input
                value={form.businessFaxNumber}
                onChange={(e) =>
                  updateField("businessFaxNumber", e.target.value)
                }
                placeholder={t("settings.businessFaxNumberPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <IdCard className="h-3.5 w-3.5" />
                {t("settings.companyIdNumber")}
              </Label>
              <Input
                value={form.companyIdNumber}
                onChange={(e) =>
                  updateField("companyIdNumber", e.target.value)
                }
                placeholder={t("settings.companyIdNumberPlaceholder")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
