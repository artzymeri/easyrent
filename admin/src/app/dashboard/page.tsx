"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Stats {
  totalCompanies: number;
  activeCompanies: number;
  totalStaff: number;
  totalCars: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const companies = await api.get<Array<{ id: number; isActive: boolean; staff: Array<{ id: number }> }>>("/companies");
        const totalCompanies = companies.length;
        const activeCompanies = companies.filter((c) => c.isActive).length;
        const totalStaff = companies.reduce((sum, c) => sum + (c.staff?.length || 0), 0);
        setStats({
          totalCompanies,
          activeCompanies,
          totalStaff,
          totalCars: 0, // We'd need a separate endpoint or aggregate for this
        });
      } catch {
        // will show 0s
        setStats({ totalCompanies: 0, activeCompanies: 0, totalStaff: 0, totalCars: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const cards = [
    { title: "Total Companies", value: stats?.totalCompanies ?? 0, desc: "Registered on platform" },
    { title: "Active Companies", value: stats?.activeCompanies ?? 0, desc: "Currently active" },
    { title: "Total Staff", value: stats?.totalStaff ?? 0, desc: "Across all companies" },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Overview of the EasyRent platform
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardDescription>{card.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold sm:text-3xl">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
