"use client";

import { useCallback } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { CompanyData } from "../../types";
import type { StepCompanyProps } from "./types";
import { NameSubdomainSection } from "./name-subdomain-section";
import { ContactSection } from "./contact-section";
import { LocationSection } from "./location-section";
import { BrandingSection } from "./branding-section";
import { BusinessInfoSection } from "./business-info-section";

export function StepCompany({
  company,
  setCompany,
  subdomainStatus,
  loading,
  onSubmit,
}: StepCompanyProps) {
  const update = useCallback(
    (field: keyof CompanyData, value: string) =>
      setCompany((prev) => ({ ...prev, [field]: value })),
    [setCompany]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Company Details</h2>
        <p className="text-sm text-muted-foreground">
          Enter the basic information about the rental company
        </p>
      </div>

      <NameSubdomainSection
        company={company}
        update={update}
        subdomainStatus={subdomainStatus}
      />

      <ContactSection company={company} update={update} />

      <LocationSection company={company} update={update} />

      <BrandingSection company={company} update={update} />

      <BusinessInfoSection company={company} update={update} />

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
