"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload, type ImageItem } from "@/components/image-upload";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, X } from "lucide-react";

interface CarImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface CarDetail {
  id: number;
  make: string;
  model: string;
  year: number | null;
  color: string;
  licensePlate: string;
  vin: string;
  engine: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  seats: number;
  dailyRate: number | null;
  status: string;
  notes: string;
  registrationExpiry: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  nextServiceMileage: number | null;
  repairParts: string[] | null;
  images: CarImage[];
}

export default function CarEditPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const REPAIR_PARTS = [
    "door", "engine", "windshield", "tires", "brakes", "suspension",
    "exhaust", "lights", "mirrors", "bumper", "hood", "trunk",
    "interior", "electrical", "ac", "battery", "radiator", "clutch",
    "steering", "wipers",
  ];

  // Track which existing images were deleted
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vin: "",
    engine: "",
    fuelType: "gasoline",
    transmission: "automatic",
    mileage: "",
    seats: "5",
    dailyRate: "",
    status: "available",
    notes: "",
    registrationExpiry: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
    lastServiceDate: "",
    nextServiceDate: "",
    nextServiceMileage: "",
    repairParts: [] as string[],
  });

  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [car, makesData] = await Promise.all([
          api.get<CarDetail>(`/cars/${params.id}`),
          api.get<string[]>("/data/car-makes"),
        ]);

        setMakes(makesData);

        // Load models for the car's make
        if (car.make) {
          try {
            const modelsData = await api.get<string[]>(
              `/data/car-models/${encodeURIComponent(car.make)}`,
            );
            setModels(modelsData);
          } catch {
            setModels([]);
          }
        }

        setForm({
          make: car.make || "",
          model: car.model || "",
          year: car.year ? String(car.year) : "",
          color: car.color || "",
          licensePlate: car.licensePlate || "",
          vin: car.vin || "",
          engine: car.engine || "",
          fuelType: car.fuelType || "gasoline",
          transmission: car.transmission || "automatic",
          mileage: car.mileage ? String(car.mileage) : "",
          seats: car.seats ? String(car.seats) : "5",
          dailyRate: car.dailyRate ? String(car.dailyRate) : "",
          status: car.status || "available",
          notes: car.notes || "",
          registrationExpiry: car.registrationExpiry || "",
          insuranceProvider: car.insuranceProvider || "",
          insurancePolicyNumber: car.insurancePolicyNumber || "",
          insuranceExpiry: car.insuranceExpiry || "",
          lastServiceDate: car.lastServiceDate || "",
          nextServiceDate: car.nextServiceDate || "",
          nextServiceMileage: car.nextServiceMileage
            ? String(car.nextServiceMileage)
            : "",
          repairParts: car.repairParts || [],
        });

        // Map existing images
        setImages(
          (car.images || [])
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img) => ({
              id: img.id,
              url: img.url,
              isPrimary: img.isPrimary,
            })),
        );
      } catch {
        toast.error(t("carDetail.failedLoad"));
        router.push("/dashboard/cars");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadModels = async (make: string) => {
    try {
      const data = await api.get<string[]>(
        `/data/car-models/${encodeURIComponent(make)}`,
      );
      setModels(data);
    } catch {
      setModels([]);
    }
  };

  const handleImageChange = (updated: ImageItem[]) => {
    // Detect removed existing images
    const currentExistingIds = updated
      .filter((img) => img.id)
      .map((img) => img.id!);
    const removedIds = images
      .filter((img) => img.id && !currentExistingIds.includes(img.id))
      .map((img) => img.id!);

    if (removedIds.length > 0) {
      setDeletedImageIds((prev) => [...prev, ...removedIds]);
    }

    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model) {
      toast.error(t("carsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      // 1. Delete removed images
      for (const imgId of deletedImageIds) {
        await api.delete(`/cars/images/${imgId}`);
      }

      // 2. Collect new images (ones without an id)
      const newImageUrls = images
        .filter((img) => !img.id)
        .map((img) => img.url);

      // 3. Update car fields + new images
      await api.put(`/cars/${params.id}`, {
        make: form.make,
        model: form.model,
        year: form.year ? parseInt(form.year) : null,
        color: form.color || null,
        licensePlate: form.licensePlate || null,
        vin: form.vin || null,
        engine: form.engine || null,
        fuelType: form.fuelType,
        transmission: form.transmission,
        mileage: form.mileage ? parseInt(form.mileage) : 0,
        seats: form.seats ? parseInt(form.seats) : 5,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : null,
        status: form.status,
        notes: form.notes || null,
        registrationExpiry: form.registrationExpiry || null,
        insuranceProvider: form.insuranceProvider || null,
        insurancePolicyNumber: form.insurancePolicyNumber || null,
        insuranceExpiry: form.insuranceExpiry || null,
        lastServiceDate: form.lastServiceDate || null,
        nextServiceDate: form.nextServiceDate || null,
        nextServiceMileage: form.nextServiceMileage
          ? parseInt(form.nextServiceMileage)
          : null,
        repairParts: form.status === "needs_repair" ? form.repairParts : null,
        images: newImageUrls.length > 0 ? newImageUrls : undefined,
      });

      // 4. Update primary image if changed
      const primaryImg = images.find((img) => img.isPrimary && img.id);
      if (primaryImg?.id) {
        await api.put(`/cars/images/${primaryImg.id}/primary`, {});
      }

      // 5. Persist image sort order for existing images
      const existingImageIds = images
        .filter((img) => img.id)
        .map((img) => img.id!);
      if (existingImageIds.length > 0) {
        await api.put(`/cars/${params.id}/images/reorder`, {
          imageIds: existingImageIds,
        });
      }

      toast.success(t("carEdit.saved"));
      router.push(`/dashboard/cars/${params.id}`);
    } catch {
      toast.error(t("carEdit.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => router.push(`/dashboard/cars/${params.id}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("carEdit.title")}
            </h1>
            <p className="text-muted-foreground">
              {form.make} {form.model}
              {form.year ? ` (${form.year})` : ""}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Main form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>{t("carEdit.basicInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("carsPage.make")} *</Label>
                    <Select
                      value={form.make}
                      onValueChange={(val) => {
                        setForm({ ...form, make: val ?? "", model: "" });
                        if (val) loadModels(val);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("carsPage.selectMake")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {makes.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carsPage.model")} *</Label>
                    <Select
                      value={form.model}
                      onValueChange={(val) =>
                        setForm({ ...form, model: val ?? "" })
                      }
                      disabled={!form.make}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            form.make
                              ? t("carsPage.selectModel")
                              : t("carsPage.selectMakeFirst")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{t("carsPage.year")}</Label>
                    <Input
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: e.target.value })
                      }
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carsPage.color")}</Label>
                    <Input
                      value={form.color}
                      onChange={(e) =>
                        setForm({ ...form, color: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carsPage.licensePlate")}</Label>
                    <Input
                      value={form.licensePlate}
                      onChange={(e) =>
                        setForm({ ...form, licensePlate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{t("carDetail.vin")}</Label>
                    <Input
                      value={form.vin}
                      onChange={(e) =>
                        setForm({ ...form, vin: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.engine")}</Label>
                    <Input
                      value={form.engine}
                      onChange={(e) =>
                        setForm({ ...form, engine: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.seats")}</Label>
                    <Input
                      type="number"
                      value={form.seats}
                      onChange={(e) =>
                        setForm({ ...form, seats: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{t("carsPage.fuelType")}</Label>
                    <Select
                      value={form.fuelType}
                      onValueChange={(val) =>
                        setForm({ ...form, fuelType: val ?? "gasoline" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t(`carsPage.fuelTypes.${form.fuelType}`)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">
                          {t("carsPage.fuelTypes.gasoline")}
                        </SelectItem>
                        <SelectItem value="diesel">
                          {t("carsPage.fuelTypes.diesel")}
                        </SelectItem>
                        <SelectItem value="electric">
                          {t("carsPage.fuelTypes.electric")}
                        </SelectItem>
                        <SelectItem value="hybrid">
                          {t("carsPage.fuelTypes.hybrid")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carsPage.transmission")}</Label>
                    <Select
                      value={form.transmission}
                      onValueChange={(val) =>
                        setForm({ ...form, transmission: val ?? "automatic" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t(`carsPage.transmissions.${form.transmission}`)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">
                          {t("carsPage.transmissions.automatic")}
                        </SelectItem>
                        <SelectItem value="manual">
                          {t("carsPage.transmissions.manual")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.mileage")}</Label>
                    <Input
                      type="number"
                      value={form.mileage}
                      onChange={(e) =>
                        setForm({ ...form, mileage: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t("carEdit.pricingStatus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("carsPage.dailyRate")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.dailyRate}
                      onChange={(e) =>
                        setForm({ ...form, dailyRate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.status")}</Label>
                    <Select
                      value={form.status}
                      onValueChange={(val) =>
                        setForm({ ...form, status: val ?? "available" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t(`carsPage.statuses.${form.status}`)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          {t("carsPage.statuses.available")}
                        </SelectItem>
                        <SelectItem value="rented">
                          {t("carsPage.statuses.rented")}
                        </SelectItem>
                        <SelectItem value="maintenance">
                          {t("carsPage.statuses.maintenance")}
                        </SelectItem>
                        <SelectItem value="out_of_service">
                          {t("carsPage.statuses.out_of_service")}
                        </SelectItem>
                        <SelectItem value="needs_repair">
                          {t("carsPage.statuses.needs_repair")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.status === "needs_repair" && (
                  <div className="mt-4 space-y-2">
                    <Label>{t("carsPage.repairParts")}</Label>
                    <p className="text-xs text-muted-foreground">{t("carsPage.repairPartsHint")}</p>
                    <div className="flex flex-wrap gap-2">
                      {REPAIR_PARTS.map((part) => {
                        const selected = form.repairParts.includes(part);
                        return (
                          <button
                            key={part}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                repairParts: selected
                                  ? f.repairParts.filter((p) => p !== part)
                                  : [...f.repairParts, part],
                              }));
                            }}
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                              selected
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {t(`carsPage.repairPartsList.${part}`)}
                            {selected && <X className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registration & Insurance */}
            <Card>
              <CardHeader>
                <CardTitle>{t("carDetail.insurance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("carDetail.registrationExpiry")}</Label>
                    <DatePicker
                      value={form.registrationExpiry}
                      onChange={(val) =>
                        setForm({
                          ...form,
                          registrationExpiry: val,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.insuranceProvider")}</Label>
                    <Input
                      value={form.insuranceProvider}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          insuranceProvider: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("carDetail.policyNumber")}</Label>
                    <Input
                      value={form.insurancePolicyNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          insurancePolicyNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.insuranceExpiry")}</Label>
                    <DatePicker
                      value={form.insuranceExpiry}
                      onChange={(val) =>
                        setForm({ ...form, insuranceExpiry: val })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service */}
            <Card>
              <CardHeader>
                <CardTitle>{t("carDetail.service")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{t("carDetail.lastService")}</Label>
                    <DatePicker
                      value={form.lastServiceDate}
                      onChange={(val) =>
                        setForm({ ...form, lastServiceDate: val })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.nextService")}</Label>
                    <DatePicker
                      value={form.nextServiceDate}
                      onChange={(val) =>
                        setForm({ ...form, nextServiceDate: val })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("carDetail.nextServiceMileage")}</Label>
                    <Input
                      type="number"
                      value={form.nextServiceMileage}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          nextServiceMileage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>{t("carDetail.notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  rows={4}
                  placeholder={t("carEdit.notesPlaceholder")}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column: Images */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("carEdit.images")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  images={images}
                  onChange={handleImageChange}
                  max={10}
                />
              </CardContent>
            </Card>

            {/* Save actions (sticky on scroll) */}
            <div className="sticky top-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={saving} className="w-full">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("carEdit.saving")}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {t("carEdit.saveChanges")}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/dashboard/cars/${params.id}`)
                      }
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
