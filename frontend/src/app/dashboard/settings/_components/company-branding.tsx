"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/lib/i18n";
import { LogoCropper } from "@/components/logo-cropper";
import {
  Quote,
  Pen,
  Stamp,
  Upload,
  Trash2,
  Camera,
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
import type { CompanyBrandingProps } from "./company-types";

const SignaturePad = dynamic(
  () => import("@/components/signature-pad").then((m) => m.SignaturePad),
  { ssr: false }
);

export function CompanyBranding({ form, updateField }: CompanyBrandingProps) {
  const { t } = useTranslation();

  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [stampCropperOpen, setStampCropperOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);

  return (
    <>
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
