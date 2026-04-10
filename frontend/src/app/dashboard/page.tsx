"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import type { DashboardData } from "./_components/types";
import { DashboardAlerts } from "./_components/dashboard-alerts";
import { DashboardStats } from "./_components/dashboard-stats";
import { DashboardCharts } from "./_components/dashboard-charts";
import { DashboardRecentBookings } from "./_components/dashboard-recent-bookings";

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

  const navigate = (path: string) => router.push(path);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/dashboard/bookings")}>
            <CalendarDays className="mr-1.5 h-4 w-4" />
            {t("bookingsPage.newBooking")}
          </Button>
        </div>
      </div>

      <DashboardAlerts data={data} t={t} />

      <DashboardStats data={data} t={t} fc={fc} onNavigate={navigate} />

      <DashboardCharts data={data} t={t} fc={fc} />

      <DashboardRecentBookings
        bookings={data.recentBookings}
        t={t}
        fc={fc}
        onNavigate={navigate}
      />
    </div>
  );
}
