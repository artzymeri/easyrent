"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DashboardStats {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  totalCustomers: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  customer: { firstName: string; lastName: string };
  car: { make: string; model: string };
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cars
        const cars = await api.get<{ rows: { status: string }[]; count: number }>("/cars");
        const totalCars = cars.count || 0;
        const carRows = cars.rows || [];
        const availableCars = carRows.filter((c) => c.status === "available").length;
        const rentedCars = carRows.filter((c) => c.status === "rented").length;
        const maintenanceCars = carRows.filter((c) => c.status === "maintenance").length;

        // Fetch customers
        const customers = await api.get<{ count: number }>("/customers");

        // Fetch bookings
        const bookings = await api.get<{ rows: RecentBooking[]; count: number }>("/bookings?limit=5");
        const totalBookings = bookings.count || 0;
        const bookingRows = bookings.rows || [];
        const activeBookings = bookingRows.filter((b) => b.status === "in_progress").length;
        const pendingBookings = bookingRows.filter((b) => b.status === "pending_start").length;

        setStats({
          totalCars,
          availableCars,
          rentedCars,
          maintenanceCars,
          totalCustomers: customers.count || 0,
          totalBookings,
          activeBookings,
          pendingBookings,
        });

        setRecentBookings(bookingRows.slice(0, 5));
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("dashboard.loadingDashboard")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dashboard.totalCars")}</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalCars ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats?.availableCars ?? 0} {t("dashboard.available")} · {stats?.rentedCars ?? 0} {t("dashboard.rented")} · {stats?.maintenanceCars ?? 0} {t("dashboard.maintenance")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dashboard.customers")}</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalCustomers ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("dashboard.registeredCustomers")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dashboard.totalBookings")}</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalBookings ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats?.activeBookings ?? 0} {t("dashboard.activeBookings")} · {stats?.pendingBookings ?? 0} {t("dashboard.pendingBookings")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("dashboard.fleetUtilization")}</CardDescription>
            <CardTitle className="text-3xl">
              {stats?.totalCars
                ? Math.round(((stats.rentedCars || 0) / stats.totalCars) * 100)
                : 0}
              %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("dashboard.carsCurrentlyRented")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentBookings")}</CardTitle>
          <CardDescription>{t("dashboard.latestActivity")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("dashboard.noBookingsYet")}
            </p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <span className="font-medium">
                      {b.customer?.firstName} {b.customer?.lastName}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {b.car?.make} {b.car?.model}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(b.startDate).toLocaleDateString()} →{" "}
                      {new Date(b.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      b.status === "in_progress"
                        ? "default"
                        : b.status === "completed"
                        ? "secondary"
                        : b.status === "cancelled"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {t(`bookingsPage.statuses.${b.status}`) || b.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
