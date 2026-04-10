import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, type Column, type DataTableAction } from "@/components/data-table";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Car } from "./types";

export function statusColor(status: string) {
  switch (status) {
    case "available": return "default" as const;
    case "rented": return "destructive" as const;
    case "maintenance": return "secondary" as const;
    default: return "outline" as const;
  }
}

// Helper to get localized color name
function getColorDisplay(car: Car, locale: string): string {
  // If we have the new carColor relation, use it
  if (car.carColor) {
    return locale === "sq" ? car.carColor.nameSq : car.carColor.nameEn;
  }
  // Fall back to legacy color field
  return car.color || "";
}

export function getCarColumns(
  t: (key: string, params?: Record<string, string>) => string,
  fc: (amount: number) => string,
  locale: string = "en",
): Column<Car>[] {
  return [
    {
      key: "car",
      header: t("carsPage.tableHeaders.car"),
      sortValue: (c) => `${c.make} ${c.model}`,
      render: (c) => {
        const colorDisplay = getColorDisplay(c, locale);
        return (
          <div className="flex items-center gap-2">
            {c.carColor?.hex && (
              <span
                className="size-3 shrink-0 rounded-full border"
                style={{ backgroundColor: c.carColor.hex }}
              />
            )}
            <div>
              <span className="font-medium">{c.make} {c.model}</span>
              <span className="ml-1 text-muted-foreground">
                {c.year ? `(${c.year})` : ""}
                {colorDisplay ? ` · ${colorDisplay}` : ""}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "license",
      header: t("carsPage.tableHeaders.license"),
      sortValue: (c) => c.licensePlate || "",
      render: (c) => (
        <span className="font-mono text-sm">{c.licensePlate || "—"}</span>
      ),
    },
    {
      key: "fuelTrans",
      header: t("carsPage.tableHeaders.fuelTrans"),
      sortValue: (c) => `${c.fuelType} ${c.transmission}`,
      render: (c) => (
        <span>{t(`carsPage.fuelTypes.${c.fuelType}`)} / {t(`carsPage.transmissions.${c.transmission}`)}</span>
      ),
    },
    {
      key: "mileage",
      header: t("carsPage.tableHeaders.mileage"),
      sortValue: (c) => c.mileage || 0,
      render: (c) => <span>{c.mileage?.toLocaleString()} km</span>,
    },
    {
      key: "rate",
      header: t("carsPage.tableHeaders.rate"),
      sortValue: (c) => c.dailyRate || 0,
      render: (c) => (
        <span>{c.dailyRate ? `${fc(c.dailyRate)}/${t("bookingsPage.perDay")}` : "—"}</span>
      ),
    },
    {
      key: "status",
      header: t("carsPage.tableHeaders.status"),
      sortValue: (c) => c.status,
      render: (c) => <Badge variant={statusColor(c.status)}>{t(`carsPage.statuses.${c.status}`) || c.status}</Badge>,
    },
  ];
}

export function getCarActions(
  t: (key: string, params?: Record<string, string>) => string,
  router: { push: (path: string) => void },
  openEditSheet: (car: Car) => void,
  fetchCars: () => void,
): DataTableAction<Car>[] {
  return [
    {
      label: t("common.view"),
      icon: <Eye className="h-4 w-4" />,
      onClick: (c) => router.push(`/dashboard/cars/${c.id}`),
    },
    {
      label: t("common.edit"),
      icon: <Pencil className="h-4 w-4" />,
      onClick: (c) => openEditSheet(c),
    },
    {
      label: t("common.delete"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (c) => {
        if (!confirm(t("common.confirmDelete"))) return;
        try {
          await api.delete(`/cars/${c.id}`);
          toast.success(t("common.deleted"));
          fetchCars();
        } catch {
          toast.error(t("common.failedDelete"));
        }
      },
      variant: "destructive",
    },
  ];
}
