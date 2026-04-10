"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
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
import type { DashboardData } from "./types";
import { MONTH_KEYS } from "./types";

interface DashboardChartsProps {
  data: DashboardData;
  t: (key: string) => string;
  fc: (value: number | string) => string;
}

export function DashboardCharts({ data, t, fc }: DashboardChartsProps) {
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
  );
}
