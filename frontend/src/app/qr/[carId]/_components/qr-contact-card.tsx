"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, Building2 } from "lucide-react";
import type { Company } from "./types";

interface QrContactCardProps {
  company: Company;
  showLabel?: boolean;
}

export function QrContactCard({ company, showLabel = false }: QrContactCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {showLabel ? (
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Contact {company.name}</h3>
          </div>
        ) : (
          <h3 className="text-sm font-semibold mb-2">Contact</h3>
        )}
        <div className="space-y-1.5 text-sm">
          {company.phone && (
            <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-blue-600">
              <Phone className="h-3.5 w-3.5" />
              {company.phone}
            </a>
          )}
          {company.email && (
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-blue-600">
              <Mail className="h-3.5 w-3.5" />
              {company.email}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
