"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, Trash2 } from "lucide-react";
import type { Company } from "./types";

interface CompanyLogoSectionProps {
  company: Company;
  onOpenLogoCropper: () => void;
  onRemoveLogo: () => void;
}

export function CompanyLogoSection({
  company,
  onOpenLogoCropper,
  onRemoveLogo,
}: CompanyLogoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Company Logo</CardTitle>
            <CardDescription>
              Square logo used across the platform
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenLogoCropper}
            >
              <Camera className="mr-1 h-3.5 w-3.5" />
              {company.logoUrl ? "Change Logo" : "Upload Logo"}
            </Button>
            {company.logoUrl && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemoveLogo}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      {company.logoUrl && (
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border bg-muted">
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-16 w-16 overflow-hidden rounded-full border bg-muted">
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Preview of the logo in square and circular formats.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
