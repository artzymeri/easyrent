"use client";

import { useTranslation } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date-picker";
import type { CustomerForm } from "./types";
import { CountryCombobox } from "./country-combobox";
import { CityCombobox } from "./city-combobox";

interface CustomerFieldsProps {
  form: CustomerForm;
  setForm: React.Dispatch<React.SetStateAction<CustomerForm>>;
  cities: string[];
  disabled: boolean;
}

export function CustomerFields({
  form,
  setForm,
  cities,
  disabled,
}: CustomerFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.firstName")} *</Label>
          <Input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.lastName")} *</Label>
          <Input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.email")}</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.phone")} *</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={disabled}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.idNumber")}</Label>
          <Input
            value={form.idNumber}
            onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.personalNumber")}</Label>
          <Input
            value={form.personalNumber}
            onChange={(e) =>
              setForm({ ...form, personalNumber: e.target.value })
            }
            disabled={disabled}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.dateOfBirth")}</Label>
          <DatePicker
            value={form.dateOfBirth}
            onChange={(val) => setForm({ ...form, dateOfBirth: val })}
            maxDate={new Date()}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.address")}</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CountryCombobox
          value={form.country}
          disabled={disabled}
          onSelect={(country: string) =>
            setForm((prev) => ({ ...prev, country, city: "" }))
          }
        />
        <CityCombobox
          value={form.city}
          cities={cities}
          hasCountry={!!form.country}
          disabled={disabled}
          onSelect={(city: string) => setForm((prev) => ({ ...prev, city }))}
        />
      </div>
    </>
  );
}
