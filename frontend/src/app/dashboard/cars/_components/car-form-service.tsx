"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/date-picker";
import { ImageUpload } from "@/components/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload, X } from "lucide-react";
import type { CarFormServiceProps } from "./types";

/** Format stored name (lowercase-dashed) to display name (Capitalized Words) */
function formatInsuranceName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CarFormService({
  form,
  setForm,
  images,
  documents,
  sheetMode,
  insuranceProviders,
  onImageChange,
  onDocumentFiles,
  onRemoveDocument,
  docInputRef,
  t,
}: CarFormServiceProps) {
  return (
    <>
      {/* Registration & Insurance */}
      <div className="space-y-2">
        <Label>{t("carDetail.registrationExpiry")}</Label>
        <DatePicker value={form.registrationExpiry} onChange={(val) => setForm({ ...form, registrationExpiry: val })} />
      </div>
      <div className="space-y-2">
        <Label>{t("carDetail.insuranceProvider")}</Label>
        <Select
          value={form.insuranceProvider}
          onValueChange={(val) => setForm({ ...form, insuranceProvider: val ?? "" })}
        >
          <SelectTrigger className="w-full">
            {form.insuranceProvider ? (
              <span className="flex flex-1 text-left">{formatInsuranceName(form.insuranceProvider)}</span>
            ) : (
              <SelectValue placeholder={t("carDetail.selectInsuranceProvider")} />
            )}
          </SelectTrigger>
          <SelectContent>
            {insuranceProviders.filter((p) => p.isActive).map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {formatInsuranceName(p.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("carDetail.policyNumber")}</Label>
          <Input value={form.insurancePolicyNumber} onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{t("carDetail.insuranceExpiry")}</Label>
          <DatePicker value={form.insuranceExpiry} onChange={(val) => setForm({ ...form, insuranceExpiry: val })} />
        </div>
      </div>
      {/* Service */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("carDetail.lastService")}</Label>
          <DatePicker value={form.lastServiceDate} onChange={(val) => setForm({ ...form, lastServiceDate: val })} />
        </div>
        <div className="space-y-2">
          <Label>{t("carDetail.nextService")}</Label>
          <DatePicker value={form.nextServiceDate} onChange={(val) => setForm({ ...form, nextServiceDate: val })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t("carDetail.nextServiceMileage")}</Label>
        <Input type="number" value={form.nextServiceMileage} onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value })} />
      </div>
      {/* Notes */}
      <div className="space-y-2">
        <Label>{t("carDetail.notes")}</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder={t("carEdit.notesPlaceholder")} />
      </div>
      {/* Images */}
      <div className="space-y-2">
        <Label>{t("carEdit.images")}</Label>
        <ImageUpload images={images} onChange={sheetMode === "edit" ? onImageChange : (updated) => onImageChange(updated)} max={10} />
      </div>
      {/* Documents */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t("carDocuments.title")}
        </Label>
        <p className="text-xs text-muted-foreground">{t("carDocuments.uploadHint")}</p>
        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div key={doc.id ?? doc.tempId ?? i} className="flex items-center gap-2 rounded-lg border p-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm">{doc.name}</span>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onRemoveDocument(i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => docInputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-4 w-4" />
          {t("carDocuments.upload")}
        </Button>
        <input
          ref={docInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => { if (e.target.files) { onDocumentFiles(e.target.files); e.target.value = ""; } }}
        />
      </div>
    </>
  );
}
