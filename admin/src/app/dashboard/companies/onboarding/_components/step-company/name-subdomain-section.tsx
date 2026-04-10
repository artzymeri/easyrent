"use client";

import { Building2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { SubdomainStatus } from "../../types";
import type { SectionProps } from "./types";
import { SubdomainBadge } from "./subdomain-badge";

interface NameSubdomainSectionProps extends SectionProps {
  subdomainStatus: SubdomainStatus;
}

export function NameSubdomainSection({
  company,
  update,
  subdomainStatus,
}: NameSubdomainSectionProps) {
  return (
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
                  update(
                    "subdomain",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
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
  );
}
