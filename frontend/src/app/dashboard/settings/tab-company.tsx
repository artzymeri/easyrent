"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { LogoCropper } from "@/components/logo-cropper";
import {
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
  Plus,
  Pencil,
  X,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { CompanySettings, CompanyForm } from "./types";

const SignaturePad = dynamic(
  () => import("@/components/signature-pad").then((m) => m.SignaturePad),
  { ssr: false }
);

interface DeliveryPoint {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
}

interface TabCompanyProps {
  company: CompanySettings;
  onCompanyUpdate: (company: CompanySettings) => void;
  initialForm: CompanyForm;
}

export function TabCompany({ company, onCompanyUpdate, initialForm }: TabCompanyProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<CompanyForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [stampCropperOpen, setStampCropperOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);

  // Delivery points state
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [dpLoading, setDpLoading] = useState(true);
  const [newDpName, setNewDpName] = useState("");
  const [newDpAddress, setNewDpAddress] = useState("");
  const [addingDp, setAddingDp] = useState(false);
  const [showAddDp, setShowAddDp] = useState(false);
  const [editingDpId, setEditingDpId] = useState<number | null>(null);
  const [editDpName, setEditDpName] = useState("");
  const [editDpAddress, setEditDpAddress] = useState("");

  useEffect(() => {
    fetchDeliveryPoints();
  }, []);

  const fetchDeliveryPoints = async () => {
    try {
      const data = await api.get<DeliveryPoint[]>("/delivery-points");
      setDeliveryPoints(data);
    } catch {
      toast.error(t("settings.failedDeliveryPoints"));
    } finally {
      setDpLoading(false);
    }
  };

  const handleAddDp = async () => {
    if (!newDpName.trim()) return;
    setAddingDp(true);
    try {
      const point = await api.post<DeliveryPoint>("/delivery-points", {
        name: newDpName.trim(),
        address: newDpAddress.trim() || null,
      });
      setDeliveryPoints((prev) => [...prev, point].sort((a, b) => a.name.localeCompare(b.name)));
      setNewDpName("");
      setNewDpAddress("");
      setShowAddDp(false);
      toast.success(t("settings.deliveryPointAdded"));
    } catch {
      toast.error(t("settings.failedAddDeliveryPoint"));
    } finally {
      setAddingDp(false);
    }
  };

  const handleUpdateDp = async (id: number) => {
    if (!editDpName.trim()) return;
    try {
      const updated = await api.put<DeliveryPoint>(`/delivery-points/${id}`, {
        name: editDpName.trim(),
        address: editDpAddress.trim() || null,
      });
      setDeliveryPoints((prev) =>
        prev.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingDpId(null);
      toast.success(t("settings.deliveryPointUpdated"));
    } catch {
      toast.error(t("settings.failedUpdateDeliveryPoint"));
    }
  };

  const handleDeleteDp = async (id: number) => {
    try {
      await api.delete(`/delivery-points/${id}`);
      setDeliveryPoints((prev) => prev.filter((p) => p.id !== id));
      toast.success(t("settings.deliveryPointDeleted"));
    } catch {
      toast.error(t("settings.failedDeleteDeliveryPoint"));
    }
  };

  const startEditDp = (point: DeliveryPoint) => {
    setEditingDpId(point.id);
    setEditDpName(point.name);
    setEditDpAddress(point.address || "");
  };

  const updateField = (field: keyof CompanyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const data = await api.put<CompanySettings>("/settings", form);
      onCompanyUpdate(data);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-1 pb-4">
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
                  onChange={(e) => updateField("businessFaxNumber", e.target.value)}
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
                  onChange={(e) => updateField("companyIdNumber", e.target.value)}
                  placeholder={t("settings.companyIdNumberPlaceholder")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Points */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t("settings.deliveryPoints")}
                </CardTitle>
                <CardDescription>
                  {t("settings.deliveryPointsDescription")}
                </CardDescription>
              </div>
              {!showAddDp && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDp(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("settings.addDeliveryPoint")}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new delivery point form */}
            {showAddDp && (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("settings.deliveryPointName")} *</Label>
                    <Input
                      value={newDpName}
                      onChange={(e) => setNewDpName(e.target.value)}
                      placeholder={t("settings.deliveryPointNamePlaceholder")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t("settings.deliveryPointAddress")}</Label>
                    <Input
                      value={newDpAddress}
                      onChange={(e) => setNewDpAddress(e.target.value)}
                      placeholder={t("settings.deliveryPointAddressPlaceholder")}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddDp(false);
                      setNewDpName("");
                      setNewDpAddress("");
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddDp}
                    disabled={addingDp || !newDpName.trim()}
                  >
                    {addingDp ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {t("settings.addDeliveryPoint")}
                  </Button>
                </div>
              </div>
            )}

            {/* List of delivery points */}
            {dpLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : deliveryPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {t("settings.noDeliveryPoints")}
              </p>
            ) : (
              <div className="space-y-2">
                {deliveryPoints.map((point) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {editingDpId === point.id ? (
                      <>
                        <div className="flex-1 grid gap-2 sm:grid-cols-2">
                          <Input
                            value={editDpName}
                            onChange={(e) => setEditDpName(e.target.value)}
                            placeholder={t("settings.deliveryPointNamePlaceholder")}
                          />
                          <Input
                            value={editDpAddress}
                            onChange={(e) => setEditDpAddress(e.target.value)}
                            placeholder={t("settings.deliveryPointAddressPlaceholder")}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleUpdateDp(point.id)}
                          disabled={!editDpName.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setEditingDpId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{point.name}</p>
                          {point.address && (
                            <p className="text-xs text-muted-foreground truncate">{point.address}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => startEditDp(point)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteDp(point.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t bg-background pt-4 pb-2">
        <div className="flex justify-end">
          <Button onClick={handleSaveCompany} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("settings.saveChanges")}
          </Button>
        </div>
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
  );
}
