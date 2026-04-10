"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2,
  Fuel,
  Gauge,
  Users,
  Cog,
  Hash,
  Palette,
  BadgeCheck,
  CircleDollarSign,
} from "lucide-react";
import type { CarDetail } from "./types";
import { statusConfig, resolveColor } from "./types";

interface CarInfoPanelProps {
  car: CarDetail;
  t: (key: string) => string;
  fc: (amount: number) => string;
  onDelete: () => void;
}

export function CarInfoPanel({ car, t, fc, onDelete }: CarInfoPanelProps) {
  const sc = statusConfig(car.status);

  return (
    <div className="flex flex-col gap-4 lg:col-span-2">
      {/* Title + status */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {car.make} {car.model}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {car.year ? `${car.year}` : ""}
              {car.color ? ` · ${resolveColor(car.color, t)}` : ""}
              {car.licensePlate ? ` · ${car.licensePlate}` : ""}
            </p>
          </div>
          <Badge variant="outline" className={`shrink-0 ${sc.className}`}>
            {t(`carsPage.statuses.${car.status}`) || car.status}
          </Badge>
        </div>
      </div>

      {/* Price highlight */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CircleDollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("carsPage.dailyRate")}</p>
            <p className="text-xl font-bold text-primary">
              {car.dailyRate ? `${fc(car.dailyRate)}` : "—"}
              {car.dailyRate && (
                <span className="text-sm font-normal text-muted-foreground">
                  /{t("bookingsPage.perDay")}
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key specs grid */}
      <Card>
        <CardContent className="grid grid-cols-2 gap-0 p-0">
          <SpecCell
            icon={<Fuel className="h-4 w-4 text-amber-500" />}
            label={t("carsPage.fuelType")}
            value={car.fuelType ? t(`carsPage.fuelTypes.${car.fuelType}`) : "—"}
          />
          <SpecCell
            icon={<Cog className="h-4 w-4 text-violet-500" />}
            label={t("carsPage.transmission")}
            value={car.transmission ? t(`carsPage.transmissions.${car.transmission}`) : "—"}
            border="left"
          />
          <SpecCell
            icon={<Gauge className="h-4 w-4 text-blue-500" />}
            label={t("carDetail.mileage")}
            value={car.mileage ? `${car.mileage.toLocaleString()} km` : "—"}
            border="top"
          />
          <SpecCell
            icon={<Users className="h-4 w-4 text-emerald-500" />}
            label={t("carDetail.seats")}
            value={car.seats ? String(car.seats) : "—"}
            border="both"
          />
        </CardContent>
      </Card>

      {/* Extra details */}
      <Card>
        <CardContent className="space-y-3 p-4">
          {car.engine && (
            <DetailRow
              icon={<Hash className="h-3.5 w-3.5" />}
              label={t("carDetail.engine")}
              value={car.engine}
            />
          )}
          {car.vin && (
            <DetailRow
              icon={<BadgeCheck className="h-3.5 w-3.5" />}
              label={t("carDetail.vin")}
              value={car.vin}
            />
          )}
          {car.color && (
            <DetailRow
              icon={<Palette className="h-3.5 w-3.5" />}
              label={t("report.color")}
              value={resolveColor(car.color, t)}
            />
          )}
          <DetailRow
            icon={<BadgeCheck className="h-3.5 w-3.5" />}
            label={t("carsPage.licensePlate")}
            value={car.licensePlate || "—"}
          />
        </CardContent>
      </Card>

      {/* Delete button */}
      <Button variant="destructive" className="w-full" onClick={onDelete}>
        <Trash2 className="mr-1.5 h-4 w-4" />
        {t("common.delete")}
      </Button>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────── */

function SpecCell({
  icon,
  label,
  value,
  border,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  border?: "left" | "top" | "both";
}) {
  const borderCls =
    border === "left"
      ? "border-l"
      : border === "top"
        ? "border-t"
        : border === "both"
          ? "border-l border-t"
          : "";
  return (
    <div className={`flex items-center gap-3 p-4 ${borderCls}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
