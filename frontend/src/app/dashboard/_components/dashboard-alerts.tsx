"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Shield, Wrench } from "lucide-react";
import type { DashboardData } from "./types";

interface DashboardAlertsProps {
  data: DashboardData;
  t: (key: string) => string;
}

export function DashboardAlerts({ data, t }: DashboardAlertsProps) {
  const totalAlerts =
    data.bookingAlerts.endingSoon.length +
    data.bookingAlerts.overdue.length +
    data.carAlerts.registrationExpiring.length +
    data.carAlerts.registrationExpired.length +
    data.carAlerts.insuranceExpiring.length +
    data.carAlerts.insuranceExpired.length +
    data.carAlerts.serviceDue.length +
    data.carAlerts.needsRepair.length;

  if (totalAlerts === 0) return null;

  return (
    <div className="space-y-3">
      {/* Overdue bookings (RED) */}
      {data.bookingAlerts.overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-800">
                  {t("dashboard.overdueBookings")} ({data.bookingAlerts.overdue.length})
                </h3>
                <div className="mt-2 space-y-1.5">
                  {data.bookingAlerts.overdue.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-red-700">
                        {b.customer?.firstName} {b.customer?.lastName} — {b.car?.make} {b.car?.model} ({b.car?.licensePlate})
                      </span>
                      <span className="text-xs text-red-600 shrink-0">
                        {t("dashboard.endedAt")} {new Date(b.endDate).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ending soon bookings (YELLOW) */}
      {data.bookingAlerts.endingSoon.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-amber-800">
                  {t("dashboard.endingSoon")} ({data.bookingAlerts.endingSoon.length})
                </h3>
                <div className="mt-2 space-y-1.5">
                  {data.bookingAlerts.endingSoon.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-amber-700">
                        {b.customer?.firstName} {b.customer?.lastName} — {b.car?.make} {b.car?.model} ({b.car?.licensePlate})
                      </span>
                      <span className="text-xs text-amber-600 shrink-0">
                        {t("dashboard.endsAt")} {new Date(b.endDate).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired registration/insurance (RED) */}
      {(data.carAlerts.registrationExpired.length > 0 ||
        data.carAlerts.insuranceExpired.length > 0) && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-red-800">{t("dashboard.expiredAlerts")}</h3>
                <div className="mt-2 space-y-1.5">
                  {data.carAlerts.registrationExpired.map((c) => (
                    <div key={`reg-${c.id}`} className="text-sm text-red-700">
                      {c.make} {c.model} ({c.licensePlate}) — {t("dashboard.registrationExpired")}
                    </div>
                  ))}
                  {data.carAlerts.insuranceExpired.map((c) => (
                    <div key={`ins-${c.id}`} className="text-sm text-red-700">
                      {c.make} {c.model} ({c.licensePlate}) — {t("dashboard.insuranceExpiredLabel")}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring soon (YELLOW) */}
      {(data.carAlerts.registrationExpiring.length > 0 ||
        data.carAlerts.insuranceExpiring.length > 0 ||
        data.carAlerts.serviceDue.length > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-amber-800">{t("dashboard.expiringAlerts")}</h3>
                <div className="mt-2 space-y-1.5">
                  {data.carAlerts.registrationExpiring.map((c) => (
                    <div key={`reg-${c.id}`} className="text-sm text-amber-700">
                      {c.make} {c.model} ({c.licensePlate}) — {t("dashboard.registrationExpiring")} {c.registrationExpiry}
                    </div>
                  ))}
                  {data.carAlerts.insuranceExpiring.map((c) => (
                    <div key={`ins-${c.id}`} className="text-sm text-amber-700">
                      {c.make} {c.model} ({c.licensePlate}) — {t("dashboard.insuranceExpiring")} {c.insuranceExpiry}
                    </div>
                  ))}
                  {data.carAlerts.serviceDue.map((c) => (
                    <div key={`svc-${c.id}`} className="text-sm text-amber-700">
                      {c.make} {c.model} ({c.licensePlate}) — {t("dashboard.serviceDue")} {c.nextServiceDate}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Needs repair (ORANGE) */}
      {data.carAlerts.needsRepair.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <Wrench className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-orange-800">
                  {t("dashboard.carsNeedRepair")} ({data.carAlerts.needsRepair.length})
                </h3>
                <div className="mt-2 space-y-1.5">
                  {data.carAlerts.needsRepair.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-orange-700">
                        {c.make} {c.model} ({c.licensePlate})
                      </span>
                      {c.repairParts && c.repairParts.length > 0 && (
                        <div className="flex gap-1 shrink-0">
                          {c.repairParts.slice(0, 3).map((p) => (
                            <Badge key={p} variant="outline" className="text-[10px] border-orange-200 bg-orange-50 text-orange-600">
                              {t(`carsPage.repairPartsList.${p}`)}
                            </Badge>
                          ))}
                          {c.repairParts.length > 3 && (
                            <Badge variant="outline" className="text-[10px] border-orange-200 bg-orange-50 text-orange-600">
                              +{c.repairParts.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
