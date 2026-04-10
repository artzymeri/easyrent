"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { ChevronDown, Check, MapPin } from "lucide-react";

interface CityComboboxProps {
  value: string;
  cities: string[];
  hasCountry: boolean;
  disabled: boolean;
  onSelect: (city: string) => void;
}

export function CityCombobox({
  value,
  cities,
  hasCountry,
  disabled,
  onSelect,
}: CityComboboxProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{t("customersPage.city")}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled || !hasCountry}
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            />
          }
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={value ? "" : "text-muted-foreground"}>
              {value ||
                (hasCountry
                  ? t("customersPage.selectCity")
                  : t("customersPage.selectCountryFirst"))}
            </span>
          </div>
          <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={t("customersPage.searchCity")} />
            <CommandList>
              <CommandEmpty>{t("customersPage.noCityFound")}</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => {
                      onSelect(city);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1">{city}</span>
                    {value === city && (
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
  );
}
