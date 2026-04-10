"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Mail, MapPin, Phone, Users } from "lucide-react";
import type { Company, StaffMember, CarItem } from "./types";

interface CompanyOverviewCardsProps {
  company: Company;
  staff: StaffMember[];
  cars: CarItem[];
}

export function CompanyOverviewCards({
  company,
  staff,
  cars,
}: CompanyOverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Staff
          </CardDescription>
          <CardTitle className="text-2xl">{staff.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {staff.filter((s) => s.isActive).length} active
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5" />
            Cars
          </CardDescription>
          <CardTitle className="text-2xl">{cars.length}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {cars.filter((c) => c.status === "available").length} available
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Contact
          </CardDescription>
          <CardTitle className="text-sm font-normal">
            {company.email || "No email"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {company.phone || "No phone"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Location
          </CardDescription>
          <CardTitle className="text-sm font-normal">
            {company.city || "—"}
            {company.country ? `, ${company.country}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {company.address || "No address"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
