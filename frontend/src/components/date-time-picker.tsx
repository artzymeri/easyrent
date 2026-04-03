"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { format, parse, isValid } from "date-fns";
import { enUS, sq } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LOCALES = { en: enUS, sq: sq };

interface DateTimePickerProps {
  /** Value as ISO datetime string "YYYY-MM-DDTHH:mm" (or empty string) */
  value: string;
  /** Called with ISO datetime string "YYYY-MM-DDTHH:mm" */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const { locale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dateFnsLocale = LOCALES[locale] || enUS;

  // Parse the incoming value
  const parsed = value
    ? parse(value, "yyyy-MM-dd'T'HH:mm", new Date())
    : undefined;
  const isParsedValid = parsed && isValid(parsed);

  const selectedDate = isParsedValid ? parsed : undefined;
  const timeValue = isParsedValid ? format(parsed, "HH:mm") : "10:00";

  const displayValue = isParsedValid
    ? format(parsed, "dd/MM/yyyy HH:mm", { locale: dateFnsLocale })
    : null;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }
    // Preserve existing time, default to 10:00
    const [hours, minutes] = timeValue.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTimeChange = (newTime: string) => {
    if (!selectedDate) return;
    const [hours, minutes] = newTime.split(":").map(Number);
    const updated = new Date(selectedDate);
    updated.setHours(hours, minutes, 0, 0);
    onChange(format(updated, "yyyy-MM-dd'T'HH:mm"));
  };

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
        {displayValue || placeholder || t("datePicker.selectDateTime")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={dateFnsLocale}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          autoFocus
        />
        <div className="border-t px-3 py-3">
          <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {t("datePicker.time")}
          </Label>
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="h-9"
            disabled={!selectedDate}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
