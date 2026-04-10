"use client";

import { Hash, Printer, IdCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { SectionProps } from "./types";

export function BusinessInfoSection({ company, update }: SectionProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <p className="text-sm font-medium text-muted-foreground">
          Business Information
        </p>
        <Separator />

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="business-number">Business Number</Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="business-number"
                placeholder="BN-12345678"
                className="pl-10"
                value={company.businessNumber}
                onChange={(e) => update("businessNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-fax">Business Fax Number</Label>
            <div className="relative">
              <Printer className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="business-fax"
                placeholder="+383 38 123 456"
                className="pl-10"
                value={company.businessFaxNumber}
                onChange={(e) => update("businessFaxNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-id">Company ID</Label>
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="company-id"
                placeholder="ID-0001234"
                className="pl-10"
                value={company.companyIdNumber}
                onChange={(e) => update("companyIdNumber", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
