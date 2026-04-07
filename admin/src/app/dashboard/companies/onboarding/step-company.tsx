"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import type { CompanyData, SubdomainStatus } from "./types";

interface StepCompanyProps {
  company: CompanyData;
  setCompany: (data: CompanyData) => void;
  subdomainStatus: SubdomainStatus;
  loading: boolean;
  onSubmit: () => void;
}

export function StepCompany({
  company,
  setCompany,
  subdomainStatus,
  loading,
  onSubmit,
}: StepCompanyProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Company Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter the basic information for the new rental company
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                placeholder="e.g. Kosova Rent"
                className="pl-10"
              />
            </div>
          </div>

          {/* Subdomain */}
          <div className="space-y-2">
            <Label htmlFor="subdomain" className="text-sm font-medium">
              Subdomain <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-stretch">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="subdomain"
                  value={company.subdomain}
                  onChange={(e) =>
                    setCompany({
                      ...company,
                      subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    })
                  }
                  placeholder="kosova-rent"
                  className={`rounded-r-none border-r-0 pl-10 pr-9 ${
                    subdomainStatus === "available"
                      ? "border-green-500 focus-visible:ring-green-500"
                      : subdomainStatus === "taken" || subdomainStatus === "reserved" || subdomainStatus === "invalid"
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }`}
                />
                {subdomainStatus === "checking" && (
                  <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
                {subdomainStatus === "available" && (
                  <CheckCircle2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                )}
                {(subdomainStatus === "taken" || subdomainStatus === "reserved" || subdomainStatus === "invalid") && (
                  <XCircle className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                )}
              </div>
              <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3">
                <span className="text-sm font-medium text-muted-foreground">.kindura.app</span>
              </div>
            </div>
            {subdomainStatus === "available" && (
              <p className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" /> This subdomain is available
              </p>
            )}
            {subdomainStatus === "taken" && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3 w-3" /> This subdomain is already taken
              </p>
            )}
            {subdomainStatus === "reserved" && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3 w-3" /> This subdomain is reserved
              </p>
            )}
            {subdomainStatus === "invalid" && (
              <p className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="h-3 w-3" /> Must start and end with a letter or number
              </p>
            )}
          </div>

          <Separator />

          {/* Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  placeholder="info@company.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  placeholder="+383 44 000 000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                placeholder="Street address"
                rows={2}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium">City</Label>
              <Input
                id="city"
                value={company.city}
                onChange={(e) => setCompany({ ...company, city: e.target.value })}
                placeholder="Pristina"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">Country</Label>
              <Input
                id="country"
                value={company.country}
                onChange={(e) => setCompany({ ...company, country: e.target.value })}
                placeholder="Kosovo"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={loading || (!!company.subdomain && subdomainStatus !== "available")}
          size="lg"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
