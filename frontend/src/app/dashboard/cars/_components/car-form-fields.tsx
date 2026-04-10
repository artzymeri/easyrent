"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { COLOR_KEYS, REPAIR_PARTS, type CarFormFieldsProps } from "./types";

export function CarFormFields({
  form,
  setForm,
  makes,
  models,
  loadModels,
  sheetMode,
  t,
}: CarFormFieldsProps) {
  return (
    <>
      {/* Make */}
      <div className="space-y-2">
        <Label>{t("carsPage.make")} *</Label>
        <Select
          value={form.make}
          onValueChange={(val) => {
            setForm({ ...form, make: val ?? "", model: "" });
            if (val) loadModels(val);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("carsPage.selectMake")} />
          </SelectTrigger>
          <SelectContent>
            {makes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Model */}
      <div className="space-y-2">
        <Label>{t("carsPage.model")} *</Label>
        <Select
          value={form.model}
          onValueChange={(val) => setForm({ ...form, model: val ?? "" })}
          disabled={!form.make}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={form.make ? t("carsPage.selectModel") : t("carsPage.selectMakeFirst")} />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Year & License Plate */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("carsPage.year")}</Label>
          <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
        </div>
        <div className="space-y-2">
          <Label>{t("carsPage.licensePlate")}</Label>
          <Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="01-234-AB" />
        </div>
      </div>
      {/* Color */}
      <div className="space-y-2">
        <Label>{t("carsPage.color")}</Label>
        <Select value={form.color} onValueChange={(val) => setForm({ ...form, color: val ?? "" })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("carsPage.selectColor")} />
          </SelectTrigger>
          <SelectContent>
            {COLOR_KEYS.map((c) => (
              <SelectItem key={c} value={c}>{t(`carsPage.colors.${c}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Fuel Type */}
      <div className="space-y-2">
        <Label>{t("carsPage.fuelType")}</Label>
        <Select value={form.fuelType} onValueChange={(val) => setForm({ ...form, fuelType: val ?? "gasoline" })}>
          <SelectTrigger className="w-full"><SelectValue>{t(`carsPage.fuelTypes.${form.fuelType}`)}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="gasoline">{t("carsPage.fuelTypes.gasoline")}</SelectItem>
            <SelectItem value="diesel">{t("carsPage.fuelTypes.diesel")}</SelectItem>
            <SelectItem value="electric">{t("carsPage.fuelTypes.electric")}</SelectItem>
            <SelectItem value="hybrid">{t("carsPage.fuelTypes.hybrid")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Transmission */}
      <div className="space-y-2">
        <Label>{t("carsPage.transmission")}</Label>
        <Select value={form.transmission} onValueChange={(val) => setForm({ ...form, transmission: val ?? "automatic" })}>
          <SelectTrigger className="w-full"><SelectValue>{t(`carsPage.transmissions.${form.transmission}`)}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="automatic">{t("carsPage.transmissions.automatic")}</SelectItem>
            <SelectItem value="manual">{t("carsPage.transmissions.manual")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Daily Rate */}
      <div className="space-y-2">
        <Label>{t("carsPage.dailyRate")}</Label>
        <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} placeholder="50" />
      </div>
      {/* VIN & Engine */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("carDetail.vin")}</Label>
          <Input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{t("carDetail.engine")}</Label>
          <Input value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} />
        </div>
      </div>
      {/* Seats & Mileage */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("carDetail.seats")}</Label>
          <Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{t("carDetail.mileage")}</Label>
          <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="0" />
        </div>
      </div>
      {/* Status (edit only) */}
      {sheetMode === "edit" && (
        <>
          <div className="space-y-2">
            <Label>{t("carDetail.status")}</Label>
            <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val ?? "available" })}>
              <SelectTrigger className="w-full"><SelectValue>{t(`carsPage.statuses.${form.status}`)}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">{t("carsPage.statuses.available")}</SelectItem>
                <SelectItem value="rented">{t("carsPage.statuses.rented")}</SelectItem>
                <SelectItem value="maintenance">{t("carsPage.statuses.maintenance")}</SelectItem>
                <SelectItem value="out_of_service">{t("carsPage.statuses.out_of_service")}</SelectItem>
                <SelectItem value="needs_repair">{t("carsPage.statuses.needs_repair")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.status === "needs_repair" && (
            <div className="space-y-2">
              <Label>{t("carsPage.repairParts")}</Label>
              <p className="text-xs text-muted-foreground">{t("carsPage.repairPartsHint")}</p>
              <div className="flex flex-wrap gap-2">
                {REPAIR_PARTS.map((part) => {
                  const selected = form.repairParts.includes(part);
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({
                          ...f,
                          repairParts: selected
                            ? f.repairParts.filter((p) => p !== part)
                            : [...f.repairParts, part],
                        }));
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t(`carsPage.repairPartsList.${part}`)}
                      {selected && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
