"use client";

import { useState } from "react";
import { Mail, Phone, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { PHONE_CODES } from "../../country-data";
import type { SectionProps } from "./types";

export function ContactSection({ company, update }: SectionProps) {
  const [phoneCodeOpen, setPhoneCodeOpen] = useState(false);

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <p className="text-sm font-medium text-muted-foreground">
          Contact Information
        </p>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company-email"
                type="email"
                placeholder="info@acme.com"
                className="pl-10"
                value={company.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <div className="flex gap-2">
              {/* Phone Code Selector */}
              <Popover open={phoneCodeOpen} onOpenChange={setPhoneCodeOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={phoneCodeOpen}
                      className="w-[110px] shrink-0 justify-between px-3 font-normal"
                    />
                  }
                >
                  <span className="truncate">{company.phoneCode}</span>
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
                              update("phoneCode", pc.code);
                              setPhoneCodeOpen(false);
                            }}
                          >
                            <span className="flex-1 truncate text-sm">
                              {pc.country}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {pc.code}
                            </span>
                            {company.phoneCode === pc.code && (
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
                  id="company-phone"
                  placeholder="44 123 456"
                  className="pl-10"
                  value={company.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
