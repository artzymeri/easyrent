"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Car,
  Users,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  Clock,
  Shield,
  Wrench,
  ChevronRight,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface BookingAlert {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  customer: { id: number; firstName: string; lastName: string; phone: string } | null;
  car: { id: number; make: string; model: string; licensePlate: string } | null;
}

interface CarAlert {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  status: string;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  nextServiceDate: string | null;
  repairParts: string[] | null;
}

interface DashboardData {
  bookingAlerts: {
    endingSoon: BookingAlert[];
    overdue: BookingAlert[];
  };
  carAlerts: {
    registrationExpiring: CarAlert[];
    registrationExpired: CarAlert[];
    insuranceExpiring: CarAlert[];
    insuranceExpired: CarAlert[];
    serviceDue: CarAlert[];
    needsRepair: CarAlert[];
  };
  fleetStats: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    outOfService: number;
    needsRepair: number;
  };
  bookingStats: {
    total: number;
    pendingStart: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    monthly: { year: number; month: number; revenue: number }[];
  };
  customerCount: number;
  recentBookings: BookingAlert[];
}

const MONTH_KEYS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.get<DashboardData>("/dashboard");
        setData(result);
      } catch {
        toast.error(t("dashboard.failedLoad"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) return null;

  const totalAlerts =
    data.bookingAlerts.endingSoon.length +
    data.bookingAlerts.overdue.length +
    data.carAlerts.registrationExpiring.length +
    data.carAlerts.registrationExpired.length +
    data.carAlerts.insuranceExpiring.length +
    data.carAlerts.insuranceExpired.length +
    data.carAlerts.serviceDue.length +
    data.carAlerts.needsRepair.length;

  const fleetPieData = [
    { name: t("dashboard.available"), value: data.fleetStats.available, color: "#10b981" },
    { name: t("dashboard.rented"), value: data.fleetStats.rented, color: "#3b82f6" },
    { name: t("dashboard.maintenance"), value: data.fleetStats.maintenance, color: "#f59e0b" },
    { name: t("dashboard.outOfService"), value: data.fleetStats.outOfService, color: "#ef4444" },
    { name: t("dashboard.needsRepair"), value: data.fleetStats.needsRepair, color: "#f97316" },
  ].filter((d) => d.value > 0);

  const revenueChartData = data.revenue.monthly.map((m) => ({
    name: t(`bookingsPage.months.${MONTH_KEYS[m.month - 1]}`).substring(0, 3),
    revenue: m.revenue,
  }));

  const utilization = data.fleetStats.total
    ? Math.round((data.fleetStats.rented / data.fleetStats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => router.push("/dashboard/bookings")}>
            <CalendarDays className="mr-1.5 h-4 w-4" />
            {t("bookingsPage.newBooking")}
          </Button>
        </div>
      </div>

      {/* ── Alerts Section ─────────────────────────────────────── */}
      {totalAlerts > 0 && (
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
      )}

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push("/dashboard/cars")}>
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

        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push("/dashboard/customers")}>
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

        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push("/dashboard/bookings")}>
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

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Revenue Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("dashboard.revenueChart")}
            </CardTitle>
            <CardDescription>{t("dashboard.last6Months")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [fc(Number(value)), t("dashboard.revenue")]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status Pie */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              {t("dashboard.fleetStatus")}
            </CardTitle>
            <CardDescription>
              {utilization}% {t("dashboard.utilization")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fleetPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} ${Number(value) === 1 ? t("dashboard.car") : t("dashboard.carPlural")}`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Bookings ────────────────────────────────────── */}
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
            onClick={() => router.push("/dashboard/bookings")}
          >
            {t("dashboard.viewAll")}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentBookings.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("dashboard.noBookingsYet")}
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push("/dashboard/bookings")}
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
    </div>
  );
}
