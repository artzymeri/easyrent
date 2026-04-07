"use client";

import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  Building2,
  Users,
  Car,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react";
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
          Everything looks good? Hit complete to finish the setup.
        </p>
      </div>

      {/* Company Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{company.name}</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {company.subdomain}
                </span>
                <span className="text-xs">.kindura.app</span>
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            {company.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {company.email}
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {company.phone}
              </div>
            )}
            {(company.city || company.country) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {[company.city, company.country].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Staff Members</h3>
            </div>
            <Badge variant="secondary">{staffList.length}</Badge>
          </div>
          <div className="space-y-2">
            {staffList.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{s.email}</span>
                </div>
                <Badge variant={s.role === "manager" ? "default" : "outline"} className="capitalize text-xs">
                  {s.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cars Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Vehicles</h3>
            </div>
            <Badge variant="secondary">{carsList.length}</Badge>
          </div>
          {carsList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cars added — can be added later from the dashboard.
            </p>
          ) : (
            <div className="space-y-2">
              {carsList.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Car className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {c.make} {c.model}
                    </span>
                    {c.year && <span className="ml-1 text-xs text-muted-foreground">({c.year})</span>}
                  </div>
                  {c.dailyRate && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatCurrency(c.dailyRate)}/day
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={onComplete} disabled={loading} size="lg" className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Completing…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" /> Complete Onboarding
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
