"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign,
  Car,
  ChevronLeft,
  ChevronRight,
  Shield,
  Wrench,
  FileText,
  ImageIcon,
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
  images: CarImage[];
  damages: CarDamage[];
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await api.get<CarDetail>(`/cars/${params.id}`);
        setCar(data);
        // Set active image to primary
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

  const statusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default" as const;
      case "rented":
        return "destructive" as const;
      case "maintenance":
        return "secondary" as const;
      default:
        return "outline" as const;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/cars")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {car.make} {car.model}
            </h1>
            <p className="text-muted-foreground">
              {car.year ? `${car.year}` : ""}
              {car.color ? ` · ${car.color}` : ""}
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Image gallery + details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Image gallery */}
          <Card>
            <CardContent className="p-0">
              {sortedImages.length > 0 ? (
                <div>
                  {/* Main image */}
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={sortedImages[activeImage]?.url}
                      alt={`${car.make} ${car.model}`}
                      className="h-full w-full object-cover"
                    />
                    {/* Nav arrows */}
                    {sortedImages.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0 opacity-80 hover:opacity-100"
                          onClick={() =>
                            setActiveImage(
                              (prev) =>
                                (prev - 1 + sortedImages.length) %
                                sortedImages.length,
                            )
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full p-0 opacity-80 hover:opacity-100"
                          onClick={() =>
                            setActiveImage(
                              (prev) => (prev + 1) % sortedImages.length,
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                          {activeImage + 1} / {sortedImages.length}
                        </span>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {sortedImages.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto p-2">
                      {sortedImages.map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveImage(i)}
                          className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                            i === activeImage
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground/30"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-[16/9] flex-col items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ImageIcon className="mb-2 h-12 w-12" />
                  <p className="text-sm">{t("carDetail.noImages")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specs grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5" />
                {t("carDetail.specifications")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <SpecItem
                  icon={<Fuel className="h-4 w-4" />}
                  label={t("carsPage.fuelType")}
                  value={
                    car.fuelType
                      ? t(`carsPage.fuelTypes.${car.fuelType}`)
                      : "—"
                  }
                />
                <SpecItem
                  icon={<Gauge className="h-4 w-4" />}
                  label={t("carDetail.mileage")}
                  value={
                    car.mileage ? `${car.mileage.toLocaleString()} km` : "—"
                  }
                />
                <SpecItem
                  icon={<Users className="h-4 w-4" />}
                  label={t("carDetail.seats")}
                  value={car.seats ? String(car.seats) : "—"}
                />
                <SpecItem
                  icon={<Car className="h-4 w-4" />}
                  label={t("carsPage.transmission")}
                  value={
                    car.transmission
                      ? t(`carsPage.transmissions.${car.transmission}`)
                      : "—"
                  }
                />
                <SpecItem
                  icon={<FileText className="h-4 w-4" />}
                  label={t("carDetail.engine")}
                  value={car.engine || "—"}
                />
                <SpecItem
                  icon={<FileText className="h-4 w-4" />}
                  label={t("carDetail.vin")}
                  value={car.vin || "—"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {car.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("carDetail.notes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {car.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Damages */}
          {car.damages && car.damages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5" />
                  {t("carDetail.damages")} ({car.damages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {car.damages.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-start gap-3 rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{d.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.location} &middot;{" "}
                          {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          d.severity === "major" ? "destructive" : "secondary"
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

        {/* Right column: Status & quick info */}
        <div className="space-y-6">
          {/* Status card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("carDetail.status")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("carDetail.currentStatus")}
                </span>
                <Badge variant={statusColor(car.status)} className="text-sm">
                  {t(`carsPage.statuses.${car.status}`) || car.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("carsPage.dailyRate")}
                </span>
                <span className="font-semibold">
                  {car.dailyRate
                    ? `$${Number(car.dailyRate).toFixed(2)}`
                    : "—"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("carsPage.licensePlate")}
                </span>
                <span className="font-mono font-medium">
                  {car.licensePlate || "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Registration & Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                {t("carDetail.insurance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label={t("carDetail.registrationExpiry")}
                value={car.registrationExpiry || "—"}
              />
              <InfoRow
                label={t("carDetail.insuranceProvider")}
                value={car.insuranceProvider || "—"}
              />
              <InfoRow
                label={t("carDetail.policyNumber")}
                value={car.insurancePolicyNumber || "—"}
              />
              <InfoRow
                label={t("carDetail.insuranceExpiry")}
                value={car.insuranceExpiry || "—"}
              />
            </CardContent>
          </Card>

          {/* Service info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5" />
                {t("carDetail.service")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label={t("carDetail.lastService")}
                value={car.lastServiceDate || "—"}
              />
              <InfoRow
                label={t("carDetail.nextService")}
                value={car.nextServiceDate || "—"}
              />
              <InfoRow
                label={t("carDetail.nextServiceMileage")}
                value={
                  car.nextServiceMileage
                    ? `${car.nextServiceMileage.toLocaleString()} km`
                    : "—"
                }
              />
            </CardContent>
          </Card>

          {/* Date added */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t("carDetail.addedOn")}{" "}
                {new Date(car.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
      <p className="font-medium">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
