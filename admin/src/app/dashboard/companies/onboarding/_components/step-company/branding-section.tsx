"use client";

import { useState } from "react";
import {
  Quote,
  Camera,
  Stamp,
  Upload,
  Trash2,
  Pen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogoCropper } from "@/components/logo-cropper";
import { SignaturePad } from "@/components/signature-pad";
import type { SectionProps } from "./types";

export function BrandingSection({ company, update }: SectionProps) {
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [stampCropperOpen, setStampCropperOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">Branding</p>
          <Separator />

          {/* Slogan */}
          <div className="space-y-2">
            <Label htmlFor="company-slogan">Slogan</Label>
            <div className="relative">
              <Quote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company-slogan"
                placeholder="Your trusted car rental partner"
                className="pl-10"
                value={company.slogan}
                onChange={(e) => update("slogan", e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Appears on the company&apos;s public website
            </p>
          </div>

          {/* Logo & Stamp side by side */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLogoCropperOpen(true)}
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    {company.logoUrl ? "Change" : "Upload"}
                  </Button>
                  {company.logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => update("logoUrl", "")}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Square ratio, auto-cropped
              </p>
            </div>

            {/* Stamp */}
            <div className="space-y-2">
              <Label>Company Stamp</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                  {company.stampUrl ? (
                    <img
                      src={company.stampUrl}
                      alt="Stamp"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Stamp className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStampCropperOpen(true)}
                  >
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    {company.stampUrl ? "Change" : "Upload"}
                  </Button>
                  {company.stampUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => update("stampUrl", "")}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Square ratio, auto-cropped
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label>Signature</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-48 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white">
                {company.signature ? (
                  <img
                    src={company.signature}
                    alt="Signature"
                    className="h-full w-auto object-contain p-1"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground/50">
                    <Pen className="h-4 w-4" />
                    <span className="text-xs">No signature</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSignaturePadOpen(true)}
                >
                  <Pen className="mr-2 h-3.5 w-3.5" />
                  {company.signature ? "Redraw" : "Draw"}
                </Button>
                {company.signature && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => update("signature", "")}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <LogoCropper
        open={logoCropperOpen}
        onOpenChange={setLogoCropperOpen}
        onSave={(base64) => {
          update("logoUrl", base64);
          setLogoCropperOpen(false);
        }}
      />
      <LogoCropper
        open={stampCropperOpen}
        onOpenChange={setStampCropperOpen}
        onSave={(base64) => {
          update("stampUrl", base64);
          setStampCropperOpen(false);
        }}
      />
      <SignaturePad
        open={signaturePadOpen}
        onOpenChange={setSignaturePadOpen}
        onSave={(base64) => update("signature", base64)}
        existingSignature={company.signature || null}
      />
    </>
  );
}
