"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTranslation, Locale } from "@/lib/i18n";
import { useCurrency, CURRENCIES } from "@/lib/currency-context";
import { api } from "@/lib/api";
import { LogoCropper } from "@/components/logo-cropper";

const SignaturePad = dynamic(
  () => import("@/components/signature-pad").then((m) => m.SignaturePad),
  { ssr: false }
);
import {
  Globe,
  DollarSign,
  Building2,
  Mail,
  Phone,
  MapPin,
  Quote,
  Hash,
  Printer,
  IdCard,
  Pen,
  Stamp,
  Upload,
  Trash2,
  Camera,
  Save,
  Loader2,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CompanySettings {
  id: number;
  name: string;
  subdomain: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  logoUrl: string | null;
  slogan: string | null;
  signature: string | null;
  stampUrl: string | null;
  businessNumber: string | null;
  businessFaxNumber: string | null;
  companyIdNumber: string | null;
}

interface StaffUser {
  id: number;
  role: "manager" | "regular";
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useTranslation();
  const { currency, setCurrencyCode } = useCurrency();

  const [user, setUser] = useState<StaffUser | null>(null);
  const isManager = user?.role === "manager";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<CompanySettings | null>(null);

  // Edit form state
  const [form, setForm] = useState({
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    slogan: "",
    logoUrl: "",
    signature: "",
    stampUrl: "",
    businessNumber: "",
    businessFaxNumber: "",
    companyIdNumber: "",
  });

  // Dialog states
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [stampCropperOpen, setStampCropperOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const [data, meData] = await Promise.all([
        api.get<CompanySettings>("/settings"),
        api.get<{ user: StaffUser }>("/auth/me"),
      ]);
      setUser(meData.user);
      setCompany(data);
      setForm({
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        slogan: data.slogan || "",
        logoUrl: data.logoUrl || "",
        signature: data.signature || "",
        stampUrl: data.stampUrl || "",
        businessNumber: data.businessNumber || "",
        businessFaxNumber: data.businessFaxNumber || "",
        companyIdNumber: data.companyIdNumber || "",
      });
    } catch {
      toast.error(t("settings.failedLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.put<CompanySettings>("/settings", form);
      setCompany(data);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      {/* ── Language ─────────────────────────────────────────── */}
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

      {/* ── Currency ─────────────────────────────────────────── */}
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

      {/* ── Company Information (manager only) ───────────────── */}
      {isManager && company && (
        <>
          {/* Company Identity (read-only name/subdomain + editable contact) */}
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
                  <Input
                    value={company.subdomain}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              {/* Editable contact fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {t("settings.email")}
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
                    {t("settings.phone")}
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

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t("settings.branding")}
              </CardTitle>
              <CardDescription>
                {t("settings.brandingDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slogan */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Quote className="h-3.5 w-3.5" />
                  {t("settings.slogan")}
                </Label>
                <Input
                  value={form.slogan}
                  onChange={(e) => updateField("slogan", e.target.value)}
                  placeholder={t("settings.sloganPlaceholder")}
                />
              </div>

              <Separator />

              {/* Logo */}
              <div className="space-y-2">
                <Label>{t("settings.logo")}</Label>
                <div className="flex items-center gap-4">
                  {form.logoUrl ? (
                    <div className="relative">
                      <img
                        src={form.logoUrl}
                        alt="Logo"
                        className="h-20 w-20 rounded-full border object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => updateField("logoUrl", "")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50"
                      onClick={() => setLogoCropperOpen(true)}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogoCropperOpen(true)}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {form.logoUrl
                      ? t("settings.changeLogo")
                      : t("settings.uploadLogo")}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Company Stamp */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Stamp className="h-3.5 w-3.5" />
                  {t("settings.stamp")}
                </Label>
                <div className="flex items-center gap-4">
                  {form.stampUrl ? (
                    <div className="relative">
                      <img
                        src={form.stampUrl}
                        alt="Stamp"
                        className="h-20 w-20 rounded-full border object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => updateField("stampUrl", "")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50"
                      onClick={() => setStampCropperOpen(true)}
                    >
                      <Stamp className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStampCropperOpen(true)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {form.stampUrl
                      ? t("settings.changeStamp")
                      : t("settings.uploadStamp")}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Signature */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Pen className="h-3.5 w-3.5" />
                  {t("settings.signature")}
                </Label>
                <div className="flex items-center gap-4">
                  {form.signature ? (
                    <div className="relative">
                      <img
                        src={form.signature}
                        alt="Signature"
                        className="h-16 rounded border bg-white object-contain p-1"
                        style={{ maxWidth: 160 }}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => updateField("signature", "")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50"
                      onClick={() => setSignaturePadOpen(true)}
                    >
                      <Pen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSignaturePadOpen(true)}
                  >
                    <Pen className="mr-2 h-4 w-4" />
                    {form.signature
                      ? t("settings.changeSignature")
                      : t("settings.drawSignature")}
                  </Button>
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
                    onChange={(e) =>
                      updateField("businessNumber", e.target.value)
                    }
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t("settings.saveChanges")}
            </Button>
          </div>

          {/* Dialogs */}
          <LogoCropper
            open={logoCropperOpen}
            onOpenChange={setLogoCropperOpen}
            onSave={(base64) => updateField("logoUrl", base64)}
            title={t("settings.logoCropper.title")}
            description={t("settings.logoCropper.description")}
          />

          <LogoCropper
            open={stampCropperOpen}
            onOpenChange={setStampCropperOpen}
            onSave={(base64) => updateField("stampUrl", base64)}
            title={t("settings.stampCropper.title")}
            description={t("settings.stampCropper.description")}
          />

          <SignaturePad
            open={signaturePadOpen}
            onOpenChange={setSignaturePadOpen}
            onSave={(base64) => updateField("signature", base64)}
            existingSignature={form.signature || null}
          />
        </>
      )}
    </div>
  );
}
