"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Car, Users, CalendarDays, DollarSign } from "lucide-react";
import type { DashboardData } from "./types";

interface DashboardStatsProps {
  data: DashboardData;
  t: (key: string) => string;
  fc: (value: number | string) => string;
  onNavigate: (path: string) => void;
}

export function DashboardStats({ data, t, fc, onNavigate }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => onNavigate("/dashboard/cars")}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
            <Car className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("dashboard.totalCars")}</p>
            <p className="text-2xl font-bold">{data.fleetStats.total}</p>
            <p className="text-xs text-muted-foreground">
              {data.fleetStats.available} {t("dashboard.available")} · {data.fleetStats.rented} {t("dashboard.rented")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => onNavigate("/dashboard/customers")}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("dashboard.customers")}</p>
            <p className="text-2xl font-bold">{data.customerCount}</p>
            <p className="text-xs text-muted-foreground">{t("dashboard.registeredCustomers")}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => onNavigate("/dashboard/bookings")}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <CalendarDays className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("dashboard.totalBookings")}</p>
            <p className="text-2xl font-bold">{data.bookingStats.total}</p>
            <p className="text-xs text-muted-foreground">
              {data.bookingStats.inProgress} {t("dashboard.activeBookings")} · {data.bookingStats.pendingStart} {t("dashboard.pendingBookings")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <DollarSign className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("dashboard.monthRevenue")}</p>
            <p className="text-2xl font-bold">{fc(data.revenue.thisMonth)}</p>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.totalLabel")}: {fc(data.revenue.total)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
