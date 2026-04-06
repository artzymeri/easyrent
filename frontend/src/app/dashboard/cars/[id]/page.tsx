"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Fuel,
  Gauge,
  Users,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Shield,
  Wrench,
  ImageIcon,
  Cog,
  Hash,
  Palette,
  BadgeCheck,
  CircleDollarSign,
  AlertTriangle,
  QrCode,
} from "lucide-react";

interface CarImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface CarDamage {
  id: number;
  description: string;
  location: string;
  severity: string;
  repaired: boolean;
  createdAt: string;
}

interface CarDetail {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  engine: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  seats: number;
  dailyRate: number;
  status: string;
  notes: string;
  registrationExpiry: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  nextServiceMileage: number;
  createdAt: string;
  qrCode: string | null;
  repairParts: string[] | null;
  images: CarImage[];
  damages: CarDamage[];
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await api.get<CarDetail>(`/cars/${params.id}`);
        setCar(data);
        const primaryIdx = data.images?.findIndex((img) => img.isPrimary) ?? 0;
        setActiveImage(primaryIdx >= 0 ? primaryIdx : 0);
      } catch {
        toast.error(t("carDetail.failedLoad"));
        router.push("/dashboard/cars");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`/cars/${params.id}`);
      toast.success(t("common.deleted"));
      router.push("/dashboard/cars");
    } catch {
      toast.error(t("common.failedDelete"));
    }
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { variant: "default" as const, className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10" };
      case "rented":
        return { variant: "default" as const, className: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/10" };
      case "maintenance":
        return { variant: "default" as const, className: "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10" };
      case "out_of_service":
        return { variant: "default" as const, className: "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/10" };
      case "needs_repair":
        return { variant: "default" as const, className: "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/10" };
      default:
        return { variant: "outline" as const, className: "" };
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!car) return null;

  const sortedImages = [...(car.images || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const sc = statusConfig(car.status);

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.push("/dashboard/cars")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {car.make} {car.model}
              </h1>
              <Badge variant={sc.variant} className={sc.className}>
                {t(`carsPage.statuses.${car.status}`) || car.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {car.year ? `${car.year}` : ""}
              {car.color ? ` · ${t(`carsPage.colors.${car.color.toLowerCase()}`) || car.color}` : ""}
              {car.licensePlate ? ` · ${car.licensePlate}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/cars/${car.id}/edit`)}
          >
            <Pencil className="mr-1.5 h-4 w-4" />
            {t("common.edit")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {/* ── Image Gallery — Full width hero ───────────────────── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {sortedImages.length > 0 ? (
            <div>
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                <img
                  src={sortedImages[activeImage]?.url}
                  alt={`${car.make} ${car.model}`}
                  className="h-full w-full object-cover"
                />
                {sortedImages.length > 1 && (
                  <>
                    <button
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                      onClick={() =>
                        setActiveImage((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
                      }
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
                      onClick={() =>
                        setActiveImage((prev) => (prev + 1) % sortedImages.length)
                      }
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {activeImage + 1} / {sortedImages.length}
                    </span>
                  </>
                )}
              </div>
              {sortedImages.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto p-3">
                  {sortedImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        i === activeImage
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-[16/9] max-h-[300px] flex-col items-center justify-center bg-muted/50 text-muted-foreground">
              <ImageIcon className="mb-2 h-12 w-12 opacity-40" />
              <p className="text-sm">{t("carDetail.noImages")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Quick Stats Row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickStat
          icon={<CircleDollarSign className="h-4 w-4 text-emerald-500" />}
          label={t("carsPage.dailyRate")}
          value={car.dailyRate ? fc(car.dailyRate) : "—"}
        />
        <QuickStat
          icon={<Gauge className="h-4 w-4 text-blue-500" />}
          label={t("carDetail.mileage")}
          value={car.mileage ? `${car.mileage.toLocaleString()} km` : "—"}
        />
        <QuickStat
          icon={<Fuel className="h-4 w-4 text-amber-500" />}
          label={t("carsPage.fuelType")}
          value={car.fuelType ? t(`carsPage.fuelTypes.${car.fuelType}`) : "—"}
        />
        <QuickStat
          icon={<Cog className="h-4 w-4 text-violet-500" />}
          label={t("carsPage.transmission")}
          value={car.transmission ? t(`carsPage.transmissions.${car.transmission}`) : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ─────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Specifications */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <Car className="h-4.5 w-4.5 text-primary" />
                {t("carDetail.specifications")}
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                <SpecItem
                  icon={<Fuel className="h-3.5 w-3.5" />}
                  label={t("carsPage.fuelType")}
                  value={car.fuelType ? t(`carsPage.fuelTypes.${car.fuelType}`) : "—"}
                />
                <SpecItem
                  icon={<Gauge className="h-3.5 w-3.5" />}
                  label={t("carDetail.mileage")}
                  value={car.mileage ? `${car.mileage.toLocaleString()} km` : "—"}
                />
                <SpecItem
                  icon={<Users className="h-3.5 w-3.5" />}
                  label={t("carDetail.seats")}
                  value={car.seats ? String(car.seats) : "—"}
                />
                <SpecItem
                  icon={<Cog className="h-3.5 w-3.5" />}
                  label={t("carsPage.transmission")}
                  value={car.transmission ? t(`carsPage.transmissions.${car.transmission}`) : "—"}
                />
                <SpecItem
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label={t("carDetail.engine")}
                  value={car.engine || "—"}
                />
                <SpecItem
                  icon={<Palette className="h-3.5 w-3.5" />}
                  label={t("report.color")}
                  value={car.color ? (t(`carsPage.colors.${car.color.toLowerCase()}`).startsWith("carsPage.") ? car.color : t(`carsPage.colors.${car.color.toLowerCase()}`)) : "—"}
                />
                <SpecItem
                  icon={<BadgeCheck className="h-3.5 w-3.5" />}
                  label={t("carsPage.licensePlate")}
                  value={car.licensePlate || "—"}
                />
                <SpecItem
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label={t("carDetail.vin")}
                  value={car.vin || "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {car.notes && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-base font-semibold">
                  {t("carDetail.notes")}
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {car.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Damages */}
          {car.damages && car.damages.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  {t("carDetail.damages")}
                  <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {car.damages.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {car.damages.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                        d.severity === "major" ? "bg-red-500" : d.severity === "moderate" ? "bg-amber-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{d.description}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {d.location} · {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          d.severity === "major"
                            ? "border-red-200 bg-red-50 text-red-600"
                            : d.severity === "moderate"
                              ? "border-amber-200 bg-amber-50 text-amber-600"
                              : "border-blue-200 bg-blue-50 text-blue-600"
                        }
                      >
                        {d.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right column ────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Registration & Insurance */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <Shield className="h-4.5 w-4.5 text-primary" />
                {t("carDetail.insurance")}
              </h3>
              <div className="space-y-3">
                <InfoRow
                  label={t("carDetail.registrationExpiry")}
                  value={car.registrationExpiry || "—"}
                  warn={car.registrationExpiry ? isExpiringSoon(car.registrationExpiry) : false}
                />
                <Separator />
                <InfoRow
                  label={t("carDetail.insuranceProvider")}
                  value={car.insuranceProvider || "—"}
                />
                <Separator />
                <InfoRow
                  label={t("carDetail.policyNumber")}
                  value={car.insurancePolicyNumber || "—"}
                />
                <Separator />
                <InfoRow
                  label={t("carDetail.insuranceExpiry")}
                  value={car.insuranceExpiry || "—"}
                  warn={car.insuranceExpiry ? isExpiringSoon(car.insuranceExpiry) : false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service info */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <Wrench className="h-4.5 w-4.5 text-primary" />
                {t("carDetail.service")}
              </h3>
              <div className="space-y-3">
                <InfoRow
                  label={t("carDetail.lastService")}
                  value={car.lastServiceDate || "—"}
                />
                <Separator />
                <InfoRow
                  label={t("carDetail.nextService")}
                  value={car.nextServiceDate || "—"}
                  warn={car.nextServiceDate ? isExpiringSoon(car.nextServiceDate) : false}
                />
                <Separator />
                <InfoRow
                  label={t("carDetail.nextServiceMileage")}
                  value={
                    car.nextServiceMileage
                      ? `${car.nextServiceMileage.toLocaleString()} km`
                      : "—"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Date added */}
          <Card>
            <CardContent className="px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t("carDetail.addedOn")}{" "}
                {new Date(car.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Repair Parts (when needs_repair) */}
          {car.status === "needs_repair" && car.repairParts && car.repairParts.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <Wrench className="h-4.5 w-4.5 text-orange-500" />
                  {t("carsPage.repairParts")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {car.repairParts.map((part) => (
                    <Badge key={part} variant="outline" className="border-orange-200 bg-orange-50 text-orange-600">
                      {t(`carsPage.repairPartsList.${part}`)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* QR Code */}
          {car.qrCode && (
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <QrCode className="h-4.5 w-4.5 text-primary" />
                  {t("carDetail.qrCode")}
                </h3>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={car.qrCode}
                    alt="QR Code"
                    className="h-40 w-40 rounded-lg border p-1"
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    {t("carDetail.qrCodeHint")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-medium ${warn ? "text-amber-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/** Check if a date string is within 30 days of now */
function isExpiringSoon(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return diffMs > 0 && diffMs < 30 * 24 * 60 * 60 * 1000;
}
