"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "@/lib/i18n";
import { COUNTRIES } from "@/lib/country-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DatePicker } from "@/components/date-picker";
import { ChevronDown, Check, MapPin } from "lucide-react";
import type { CustomerForm } from "./types";

interface CustomerFieldsProps {
  form: CustomerForm;
  setForm: Dispatch<SetStateAction<CustomerForm>>;
  extracting: boolean;
}

export function CustomerFields({
  form,
  setForm,
  extracting,
}: CustomerFieldsProps) {
  const { t } = useTranslation();

  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.name === form.country),
    [form.country]
  );
  const cities = selectedCountry?.cities ?? [];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.firstName")} *</Label>
          <Input
            value={form.firstName}
            onChange={(e) =>
              setForm({ ...form, firstName: e.target.value })
            }
            disabled={extracting}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.lastName")} *</Label>
          <Input
            value={form.lastName}
            onChange={(e) =>
              setForm({ ...form, lastName: e.target.value })
            }
            disabled={extracting}
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
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            disabled={extracting}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.phone")} *</Label>
          <Input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            disabled={extracting}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.idNumber")}</Label>
          <Input
            value={form.idNumber}
            onChange={(e) =>
              setForm({ ...form, idNumber: e.target.value })
            }
            disabled={extracting}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.personalNumber")}</Label>
          <Input
            value={form.personalNumber}
            onChange={(e) =>
              setForm({ ...form, personalNumber: e.target.value })
            }
            disabled={extracting}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("customersPage.driversLicense")}</Label>
          <Input
            value={form.driversLicense}
            onChange={(e) =>
              setForm({ ...form, driversLicense: e.target.value })
            }
            disabled={extracting}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.driversLicenseExpiry")}</Label>
          <DatePicker
            value={form.driversLicenseExpiry}
            onChange={(val) =>
              setForm({ ...form, driversLicenseExpiry: val })
            }
            disabled={extracting}
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
            disabled={extracting}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("customersPage.address")}</Label>
          <Input
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            disabled={extracting}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Country combobox */}
        <div className="space-y-2">
          <Label>{t("customersPage.country")}</Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger
              disabled={extracting}
              render={
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-full justify-between font-normal"
                />
              }
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span
                  className={
                    form.country ? "" : "text-muted-foreground"
                  }
                >
                  {form.country || t("customersPage.selectCountry")}
                </span>
              </div>
              <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent
              className="w-(--anchor-width) p-0"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder={t("customersPage.searchCountry")}
                />
                <CommandList>
                  <CommandEmpty>
                    {t("customersPage.noCountryFound")}
                  </CommandEmpty>
                  <CommandGroup>
                    {COUNTRIES.map((c) => (
                      <CommandItem
                        key={c.code}
                        value={c.name}
                        onSelect={() => {
                          setForm((prev) => ({
                            ...prev,
                            country: c.name,
                            city: "",
                          }));
                          setCountryOpen(false);
                        }}
                      >
                        <span className="flex-1">{c.name}</span>
                        {form.country === c.name && (
                          <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* City combobox */}
        <div className="space-y-2">
          <Label>{t("customersPage.city")}</Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger
              disabled={extracting || !form.country}
              render={
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="w-full justify-between font-normal"
                />
              }
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span
                  className={
                    form.city ? "" : "text-muted-foreground"
                  }
                >
                  {form.city ||
                    (form.country
                      ? t("customersPage.selectCity")
                      : t("customersPage.selectCountryFirst"))}
                </span>
              </div>
              <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent
              className="w-(--anchor-width) p-0"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder={t("customersPage.searchCity")}
                />
                <CommandList>
                  <CommandEmpty>
                    {t("customersPage.noCityFound")}
                  </CommandEmpty>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city}
                        value={city}
                        onSelect={() => {
                          setForm((prev) => ({ ...prev, city }));
                          setCityOpen(false);
                        }}
                      >
                        <span className="flex-1">{city}</span>
                        {form.city === city && (
                          <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </>
  );
}
