"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, parse, isValid } from "date-fns";
import { enUS, sq } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LOCALES = { en: enUS, sq: sq };

interface DatePickerProps {
  /** Value as YYYY-MM-DD string (or empty string for no selection) */
  value: string;
  /** Called with YYYY-MM-DD string */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const { locale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dateFnsLocale = LOCALES[locale] || enUS;

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isSelectedValid = selected && isValid(selected);

  const displayValue = isSelectedValid
    ? format(selected, "dd/MM/yyyy", { locale: dateFnsLocale })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayValue && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {displayValue || placeholder || t("datePicker.selectDate")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isSelectedValid ? selected : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            } else {
              onChange("");
            }
            setOpen(false);
          }}
          locale={dateFnsLocale}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
