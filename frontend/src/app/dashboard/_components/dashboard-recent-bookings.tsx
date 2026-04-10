"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { BookingAlert } from "./types";

interface DashboardRecentBookingsProps {
  bookings: BookingAlert[];
  t: (key: string) => string;
  fc: (value: number | string) => string;
  onNavigate: (path: string) => void;
}

export function DashboardRecentBookings({ bookings, t, fc, onNavigate }: DashboardRecentBookingsProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base">{t("dashboard.recentBookings")}</CardTitle>
          <CardDescription>{t("dashboard.latestActivity")}</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => onNavigate("/dashboard/bookings")}
        >
          {t("dashboard.viewAll")}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {t("dashboard.noBookingsYet")}
          </p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onNavigate("/dashboard/bookings")}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {b.customer?.firstName} {b.customer?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {b.car?.make} {b.car?.model}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium">{fc(b.totalAmount)}</span>
                  <Badge
                    variant={
                      b.status === "in_progress"
                        ? "default"
                        : b.status === "completed"
                          ? "secondary"
                          : b.status === "cancelled"
                            ? "destructive"
                            : b.status === "overdue"
                              ? "destructive"
                              : "outline"
                    }
                    className="text-[10px]"
                  >
                    {t(`bookingsPage.statuses.${b.status}`) || b.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
