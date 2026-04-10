"use client";

import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Plus, X } from "lucide-react";
import { DateTimePicker } from "@/components/date-time-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingForm, Car, Customer, DeliveryPoint } from "./types";

interface NewBookingFormFieldsProps {
  form: BookingForm;
  setForm: (form: BookingForm) => void;
  cars: Car[];
  customers: Customer[];
  deliveryPoints: DeliveryPoint[];
  pickupCustom: boolean;
  setPickupCustom: (v: boolean) => void;
  returnCustom: boolean;
  setReturnCustom: (v: boolean) => void;
  onQuickCustomerOpen: () => void;
}

export function NewBookingFormFields({
  form,
  setForm,
  cars,
  customers,
  deliveryPoints,
  pickupCustom,
  setPickupCustom,
  returnCustom,
  setReturnCustom,
  onQuickCustomerOpen,
}: NewBookingFormFieldsProps) {
  const { t } = useTranslation();
  const { fc } = useCurrency();

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {/* Customer */}
      <div className="space-y-2">
        <Label>{t("bookingsPage.customer")} *</Label>
        <div className="flex gap-2">
          <Select value={form.customerId} onValueChange={(val) => setForm({ ...form, customerId: val ?? "" })}>
            <SelectTrigger className="w-full">
              {form.customerId
                ? (() => { const c = customers.find((c) => String(c.id) === form.customerId); return c ? `${c.firstName} ${c.lastName} (${c.phone})` : t("bookingsPage.selectCustomer"); })()
                : <SelectValue placeholder={t("bookingsPage.selectCustomer")} />}
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.firstName} {c.lastName} ({c.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={onQuickCustomerOpen}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Car */}
      <div className="space-y-2">
        <Label>{t("bookingsPage.car")} *</Label>
        <Select
          value={form.carId}
          onValueChange={(val) => {
            const car = cars.find((c) => String(c.id) === val);
            setForm({
              ...form,
              carId: val ?? "",
              dailyRate: car?.dailyRate ? String(car.dailyRate) : form.dailyRate,
            });
          }}
        >
          <SelectTrigger className="w-full">
            {form.carId
              ? (() => { const c = cars.find((c) => String(c.id) === form.carId); return c ? `${c.make} ${c.model} (${c.licensePlate})` : t("bookingsPage.selectCar"); })()
              : <SelectValue placeholder={t("bookingsPage.selectCar")} />}
          </SelectTrigger>
          <SelectContent>
            {cars.filter((c) => c.status === "available" || String(c.id) === form.carId).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.make} {c.model} ({c.licensePlate}) — {fc(c.dailyRate)}/{t("bookingsPage.perDay")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start & End dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("bookingsPage.startDate")} *</Label>
          <DateTimePicker value={form.startDate} onChange={(val) => setForm({ ...form, startDate: val })} minDate={new Date()} />
        </div>
        <div className="space-y-2">
          <Label>{t("bookingsPage.endDate")} *</Label>
          <DateTimePicker value={form.endDate} onChange={(val) => setForm({ ...form, endDate: val })} minDate={new Date()} />
        </div>
      </div>

      {/* Daily Rate & Discount */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("bookingsPage.dailyRate")}</Label>
          <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>{t("bookingsPage.sheetDiscount")}</Label>
          <Input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
        </div>
      </div>

      {/* Pickup & Return locations */}
      <div className="grid gap-4 sm:grid-cols-2">
        <LocationField
          label={t("bookingsPage.pickupLocation")}
          value={form.pickupLocation}
          onChange={(val) => setForm({ ...form, pickupLocation: val })}
          deliveryPoints={deliveryPoints}
          isCustom={pickupCustom}
          setIsCustom={setPickupCustom}
          placeholder={t("bookingsPage.pickupLocation")}
          selectLocationLabel={t("bookingsPage.selectLocation")}
          customLocationLabel={t("bookingsPage.customLocation")}
        />
        <LocationField
          label={t("bookingsPage.returnLocation")}
          value={form.returnLocation}
          onChange={(val) => setForm({ ...form, returnLocation: val })}
          deliveryPoints={deliveryPoints}
          isCustom={returnCustom}
          setIsCustom={setReturnCustom}
          placeholder={t("bookingsPage.returnLocation")}
          selectLocationLabel={t("bookingsPage.selectLocation")}
          customLocationLabel={t("bookingsPage.customLocation")}
        />
      </div>

      {/* Mileage Out */}
      <div className="space-y-2">
        <Label>{t("bookingsPage.sheetMileageOut")}</Label>
        <Input type="number" value={form.mileageOut} onChange={(e) => setForm({ ...form, mileageOut: e.target.value })} placeholder="km" />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{t("bookingsPage.sheetNotes")}</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
      </div>

      {/* Secondary Driver */}
      <Separator />
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{t("bookingsPage.secondaryDriverOptional")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("bookingsPage.secondaryDriverName")}</Label>
            <Input value={form.secondaryDriverName} onChange={(e) => setForm({ ...form, secondaryDriverName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("bookingsPage.secondaryDriverPhone")}</Label>
            <Input value={form.secondaryDriverPhone} onChange={(e) => setForm({ ...form, secondaryDriverPhone: e.target.value })} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("bookingsPage.secondaryDriverIdNumber")}</Label>
            <Input value={form.secondaryDriverIdNumber} onChange={(e) => setForm({ ...form, secondaryDriverIdNumber: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("bookingsPage.secondaryDriverLicense")}</Label>
            <Input value={form.secondaryDriverLicense} onChange={(e) => setForm({ ...form, secondaryDriverLicense: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationField({
  label,
  value,
  onChange,
  deliveryPoints,
  isCustom,
  setIsCustom,
  placeholder,
  selectLocationLabel,
  customLocationLabel,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  deliveryPoints: DeliveryPoint[];
  isCustom: boolean;
  setIsCustom: (v: boolean) => void;
  placeholder: string;
  selectLocationLabel: string;
  customLocationLabel: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {deliveryPoints.length > 0 && !isCustom ? (
        <Select
          value={value}
          onValueChange={(val) => {
            if (val === "__custom__") {
              setIsCustom(true);
              onChange("");
            } else {
              onChange(val ?? "");
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={selectLocationLabel} />
          </SelectTrigger>
          <SelectContent>
            {deliveryPoints.map((dp) => (
              <SelectItem key={dp.id} value={dp.name}>
                {dp.name}
              </SelectItem>
            ))}
            <SelectItem value="__custom__">{customLocationLabel}</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          {deliveryPoints.length > 0 && isCustom && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => {
                setIsCustom(false);
                onChange("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
