"use client";

import {
  Building2,
  Users,
  Car,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { CompanyData, StaffData, CarData } from "./types";

interface StepReviewProps {
  company: CompanyData;
  staffList: StaffData[];
  carsList: CarData[];
  loading: boolean;
  onBack: () => void;
  onComplete: () => void;
}

export function StepReview({
  company,
  staffList,
  carsList,
  loading,
  onBack,
  onComplete,
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review & Complete</h2>
        <p className="text-sm text-muted-foreground">
          Review the setup details and finalize onboarding
        </p>
      </div>

      {/* Company summary */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{company.name}</p>
              <p className="text-xs text-muted-foreground">Company</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {company.subdomain && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                <span>{company.subdomain}.kindura.app</span>
              </div>
            )}
            {company.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{company.phoneCode} {company.phone}</span>
              </div>
            )}
            {company.country && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {company.city ? `${company.city}, ` : ""}
                  {company.country}
                </span>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{company.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff summary */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Staff Members</p>
                <p className="text-xs text-muted-foreground">
                  {staffList.length} member{staffList.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {staffList.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {s.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cars summary */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Car className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Fleet</p>
              <p className="text-xs text-muted-foreground">
                {carsList.length} car{carsList.length !== 1 ? "s" : ""}
                {carsList.length === 0 && " — can be added later"}
              </p>
            </div>
          </div>

          {carsList.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {carsList.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {c.make} {c.model} {c.year && `(${c.year})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[c.color, c.licensePlate, c.fuelType, c.transmission]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {c.dailyRate && (
                      <Badge variant="secondary">${c.dailyRate}/day</Badge>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onComplete} disabled={loading} size="lg" className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}
