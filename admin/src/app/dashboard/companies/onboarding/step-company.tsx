"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
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

import type { CompanyData, SubdomainStatus } from "./types";
import { COUNTRIES, PHONE_CODES } from "./country-data";

interface StepCompanyProps {
  company: CompanyData;
  setCompany: React.Dispatch<React.SetStateAction<CompanyData>>;
  subdomainStatus: SubdomainStatus;
  loading: boolean;
  onSubmit: () => void;
}

function SubdomainBadge({ status }: { status: SubdomainStatus }) {
  switch (status) {
    case "checking":
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking…
        </span>
      );
    case "available":
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Available
        </span>
      );
    case "taken":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          Already taken
        </span>
      );
    case "reserved":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          Reserved
        </span>
      );
    case "invalid":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          Invalid format
        </span>
      );
    default:
      return null;
  }
}

export function StepCompany({ company, setCompany, subdomainStatus, loading, onSubmit }: StepCompanyProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [phoneCodeOpen, setPhoneCodeOpen] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.name === company.country),
    [company.country]
  );

  const cities = selectedCountry?.cities ?? [];

  const update = (field: keyof CompanyData, value: string) =>
    setCompany((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Company Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter the basic information about the rental company
        </p>
      </div>

      {/* Company Name & Subdomain */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="company-name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company-name"
                  placeholder="Acme Car Rentals"
                  className="pl-10"
                  value={company.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
            </div>

            {/* Subdomain */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="subdomain">
                  Subdomain <span className="text-destructive">*</span>
                </Label>
                <SubdomainBadge status={subdomainStatus} />
              </div>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="subdomain"
                  placeholder="acme"
                  className="pl-10"
                  value={company.subdomain}
                  onChange={(e) =>
                    update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                />
              </div>
              {company.subdomain && (
                <p className="text-xs text-muted-foreground">
                  {company.subdomain}.kindura.app
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
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
                              <span className="ml-2 text-xs text-muted-foreground">{pc.code}</span>
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

      {/* Location */}
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
                    <span className={company.country ? "" : "text-muted-foreground"}>
                      {company.country || "Select country"}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                              update("phoneCode", c.phoneCode);
                              setCountryOpen(false);
                            }}
                          >
                            <span className="flex-1">{c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.phoneCode}</span>
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
                    <span className={company.city ? "" : "text-muted-foreground"}>
                      {company.city || (company.country ? "Select city" : "Select country first")}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={loading} size="lg">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          Create Company & Continue
        </Button>
      </div>
    </div>
  );
}
