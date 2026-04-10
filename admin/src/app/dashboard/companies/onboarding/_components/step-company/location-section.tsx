"use client";

import { useMemo, useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
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
import { COUNTRIES } from "../../country-data";
import type { SectionProps } from "./types";

export function LocationSection({ company, update }: SectionProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.name === company.country),
    [company.country]
  );

  const cities = selectedCountry?.cities ?? [];

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <p className="text-sm font-medium text-muted-foreground">Location</p>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Country */}
          <div className="space-y-2">
            <Label>
              Country <span className="text-destructive">*</span>
            </Label>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger
                render={
                  <Button
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
                      company.country ? "" : "text-muted-foreground"
                    }
                  >
                    {company.country || "Select country"}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {COUNTRIES.map((c) => (
                        <CommandItem
                          key={c.code}
                          value={c.name}
                          onSelect={() => {
                            update("country", c.name);
                            update("city", "");
                            setCountryOpen(false);
                          }}
                        >
                          <span className="flex-1">{c.name}</span>
                          {company.country === c.name && (
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

          {/* City */}
          <div className="space-y-2">
            <Label>City</Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger
                disabled={!company.country}
                render={
                  <Button
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
                      company.city ? "" : "text-muted-foreground"
                    }
                  >
                    {company.city ||
                      (company.country
                        ? "Select city"
                        : "Select country first")}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search city..." />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={() => {
                            update("city", city);
                            setCityOpen(false);
                          }}
                        >
                          <span className="flex-1">{city}</span>
                          {company.city === city && (
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

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="company-address">Address</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="company-address"
              placeholder="Street address"
              className="pl-10"
              value={company.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
