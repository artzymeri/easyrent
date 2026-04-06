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
  Trash2,
  Fuel,
  Gauge,
  Users,
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
  Info,
  FileText,
  Clock,
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
        return { className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10" };
      case "rented":
        return { className: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/10" };
      case "maintenance":
        return { className: "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10" };
      case "out_of_service":
        return { className: "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/10" };
      case "needs_repair":
        return { className: "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/10" };
      default:
        return { className: "" };
    }
  };

  const resolveColor = (color: string) => {
    const translated = t(`carsPage.colors.${color.toLowerCase()}`);
    return translated.startsWith("carsPage.") ? color : translated;
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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Back button ──────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/dashboard/cars")}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Button>

      {/* ── Hero section: Image + Info side-by-side ──────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Image gallery — takes 3/5 */}
        <Card className="overflow-hidden lg:col-span-3">
          <CardContent className="p-0">
            {sortedImages.length > 0 ? (
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={sortedImages[activeImage]?.url}
                    alt={`${car.make} ${car.model}`}
                    className="h-full w-full object-cover transition-all duration-300"
                  />
                  {sortedImages.length > 1 && (
                    <>
                      <button
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur-sm transition hover:bg-white"
                        onClick={() =>
                          setActiveImage((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
                        }
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur-sm transition hover:bg-white"
                        onClick={() =>
                          setActiveImage((prev) => (prev + 1) % sortedImages.length)
                        }
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
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
              <div className="flex aspect-[4/3] flex-col items-center justify-center bg-muted/30 text-muted-foreground">
                <ImageIcon className="mb-3 h-16 w-16 opacity-30" />
                <p className="text-sm">{t("carDetail.noImages")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Car info panel — takes 2/5 */}
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
                  {car.color ? ` · ${resolveColor(car.color)}` : ""}
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
                  {car.dailyRate && <span className="text-sm font-normal text-muted-foreground">/{t("bookingsPage.perDay")}</span>}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Key specs grid */}
          <Card>
            <CardContent className="grid grid-cols-2 gap-0 p-0">
              <SpecCell icon={<Fuel className="h-4 w-4 text-amber-500" />} label={t("carsPage.fuelType")} value={car.fuelType ? t(`carsPage.fuelTypes.${car.fuelType}`) : "—"} />
              <SpecCell icon={<Cog className="h-4 w-4 text-violet-500" />} label={t("carsPage.transmission")} value={car.transmission ? t(`carsPage.transmissions.${car.transmission}`) : "—"} border="left" />
              <SpecCell icon={<Gauge className="h-4 w-4 text-blue-500" />} label={t("carDetail.mileage")} value={car.mileage ? `${car.mileage.toLocaleString()} km` : "—"} border="top" />
              <SpecCell icon={<Users className="h-4 w-4 text-emerald-500" />} label={t("carDetail.seats")} value={car.seats ? String(car.seats) : "—"} border="both" />
            </CardContent>
          </Card>

          {/* Extra details */}
          <Card>
            <CardContent className="space-y-3 p-4">
              {car.engine && (
                <DetailRow icon={<Hash className="h-3.5 w-3.5" />} label={t("carDetail.engine")} value={car.engine} />
              )}
              {car.vin && (
                <DetailRow icon={<BadgeCheck className="h-3.5 w-3.5" />} label={t("carDetail.vin")} value={car.vin} />
              )}
              {car.color && (
                <DetailRow icon={<Palette className="h-3.5 w-3.5" />} label={t("report.color")} value={resolveColor(car.color)} />
              )}
              <DetailRow icon={<BadgeCheck className="h-3.5 w-3.5" />} label={t("carsPage.licensePlate")} value={car.licensePlate || "—"} />
            </CardContent>
          </Card>

          {/* Delete button */}
          <Button variant="destructive" className="w-full" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      {/* ── Bottom grid: additional details ─────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Registration & Insurance */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              {t("carDetail.insurance")}
            </h3>
            <div className="space-y-3">
              <InfoRow
                label={t("carDetail.registrationExpiry")}
                value={car.registrationExpiry || "—"}
                warn={car.registrationExpiry ? isExpiringSoon(car.registrationExpiry) : false}
                expired={car.registrationExpiry ? isExpired(car.registrationExpiry) : false}
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
                expired={car.insuranceExpiry ? isExpired(car.insuranceExpiry) : false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service info */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Wrench className="h-4 w-4 text-primary" />
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

        {/* Meta info + QR */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Info className="h-4 w-4 text-primary" />
              {t("carDetail.specifications")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("carDetail.addedOn")}{" "}
                <span className="font-medium text-foreground">{new Date(car.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* QR Code */}
            {car.qrCode && (
              <div className="mt-5 pt-4 border-t">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <QrCode className="h-4 w-4 text-primary" />
                  {t("carDetail.qrCode")}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={car.qrCode}
                    alt="QR Code"
                    className="h-36 w-36 rounded-lg border p-1"
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    {t("carDetail.qrCodeHint")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Notes ────────────────────────────────────────────── */}
      {car.notes && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" />
              {t("carDetail.notes")}
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {car.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Repair Parts ─────────────────────────────────────── */}
      {car.status === "needs_repair" && car.repairParts && car.repairParts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              <Wrench className="h-4 w-4" />
              {t("carsPage.repairParts")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {car.repairParts.map((part) => (
                <Badge key={part} variant="outline" className="border-orange-300 bg-white text-orange-700">
                  {t(`carsPage.repairPartsList.${part}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Damages ──────────────────────────────────────────── */}
      {car.damages && car.damages.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t("carDetail.damages")}
              <Badge variant="secondary" className="ml-1 text-xs">
                {car.damages.length}
              </Badge>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {car.damages.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      d.severity === "major" ? "bg-red-500" : d.severity === "moderate" ? "bg-amber-500" : "bg-blue-500"
                    }`} />
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        d.severity === "major"
                          ? "border-red-200 bg-red-50 text-red-600"
                          : d.severity === "moderate"
                            ? "border-amber-200 bg-amber-50 text-amber-600"
                            : "border-blue-200 bg-blue-50 text-blue-600"
                      }`}
                    >
                      {d.severity}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug">{d.description}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {d.location} · {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

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
  const borderCls = border === "left" ? "border-l" : border === "top" ? "border-t" : border === "both" ? "border-l border-t" : "";
  return (
    <div className={`flex items-center gap-3 p-4 ${borderCls}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
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

function InfoRow({ label, value, warn, expired }: { label: string; value: string; warn?: boolean; expired?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-medium ${expired ? "text-red-600" : warn ? "text-amber-600" : ""}`}>
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

/** Check if a date string is in the past */
function isExpired(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now();
}
