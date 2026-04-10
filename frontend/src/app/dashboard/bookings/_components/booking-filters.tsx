"use client";

import { useTranslation } from "@/lib/i18n";
import { RotateCcw } from "lucide-react";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer } from "./types";

interface BookingFiltersProps {
  customers: Customer[];
  filterCustomerId: string;
  setFilterCustomerId: (val: string) => void;
  filterFrom: string;
  setFilterFrom: (val: string) => void;
  filterTo: string;
  setFilterTo: (val: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function BookingFilters({
  customers,
  filterCustomerId,
  setFilterCustomerId,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo,
  hasActiveFilters,
  onClearFilters,
}: BookingFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-52">
        <Label className="mb-1 text-xs text-muted-foreground">{t("bookingsPage.filterByCustomer")}</Label>
        <Select
          value={filterCustomerId}
          onValueChange={(val) => setFilterCustomerId(val === "__all__" ? "" : (val ?? ""))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("bookingsPage.allCustomers")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("bookingsPage.allCustomers")}</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.firstName} {c.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-44">
        <Label className="mb-1 text-xs text-muted-foreground">{t("bookingsPage.filterFrom")}</Label>
        <DatePicker value={filterFrom} onChange={setFilterFrom} placeholder={t("bookingsPage.filterFrom")} />
      </div>
      <div className="w-44">
        <Label className="mb-1 text-xs text-muted-foreground">{t("bookingsPage.filterTo")}</Label>
        <DatePicker value={filterTo} onChange={setFilterTo} placeholder={t("bookingsPage.filterTo")} />
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          {t("bookingsPage.clearFilters")}
        </Button>
      )}
    </div>
  );
}
