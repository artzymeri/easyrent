"use client";

import { useState } from "react";
import { ChevronDown, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PHONE_CODES } from "./country-data";

interface PhoneCodePickerProps {
  phoneCode: string;
  phone: string;
  onPhoneCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  inputId?: string;
}

export function PhoneCodePicker({
  phoneCode,
  phone,
  onPhoneCodeChange,
  onPhoneChange,
  inputId = "phone",
}: PhoneCodePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[110px] shrink-0 justify-between px-3 font-normal"
            />
          }
        >
          <span className="truncate">{phoneCode}</span>
          <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search code..." />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup>
                {PHONE_CODES.map((pc) => (
                  <CommandItem
                    key={`${pc.code}-${pc.country}`}
                    value={`${pc.country} ${pc.code}`}
                    onSelect={() => {
                      onPhoneCodeChange(pc.code);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1 truncate text-sm">{pc.country}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{pc.code}</span>
                    {phoneCode === pc.code && (
                      <Check className="ml-1 h-3.5 w-3.5 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="relative flex-1">
        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          placeholder="44 123 456"
          className="pl-10"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
      </div>
    </div>
  );
}
