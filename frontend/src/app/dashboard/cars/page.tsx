"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { DataTable, Eye, Pencil, Trash2, type Column, type DataTableAction } from "@/components/data-table";
import { ImageUpload, type ImageItem } from "@/components/image-upload";
import { X, FileText, Upload } from "lucide-react";

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  status: string;
  dailyRate: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  seats: number;
  images?: { id: number; isPrimary: boolean }[];
}

interface DocumentItem {
  /** DB id for existing documents */
  id?: number;
  /** Client-side id for new documents */
  tempId?: string;
  name: string;
  url: string;
  type: string;
}

const COLOR_KEYS = [
  "black", "white", "silver", "gray", "red", "blue",
  "green", "yellow", "orange", "brown", "beige", "gold",
  "maroon", "navy", "purple", "pink",
] as const;

const REPAIR_PARTS = [
  "door", "engine", "windshield", "tires", "brakes", "suspension",
  "exhaust", "lights", "mirrors", "bumper", "hood", "trunk",
  "interior", "electrical", "ac", "battery", "radiator", "clutch",
  "steering", "wipers",
] as const;

const EMPTY_FORM = {
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
};

export default function CarsPage() {
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editCarId, setEditCarId] = useState<number | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [deletedDocumentIds, setDeletedDocumentIds] = useState<number[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchCars = async () => {
    try {
      const data = await api.get<{ rows: Car[] }>("/cars");
      setCars(data.rows || []);
    } catch {
      toast.error(t("carsPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMakes = async () => {
    if (makes.length > 0) return;
    try {
      const data = await api.get<string[]>("/data/car-makes");
      setMakes(data);
    } catch {
      toast.error(t("carsPage.toast.failedLoadMakes"));
    }
  };

  const loadModels = async (make: string) => {
    try {
      const data = await api.get<string[]>(`/data/car-models/${encodeURIComponent(make)}`);
      setModels(data);
    } catch {
      setModels([]);
    }
  };

  // ── Open sheet for creating ──────────────────────────────────
  const openCreateSheet = () => {
    setSheetMode("create");
    setEditCarId(null);
    setForm({ ...EMPTY_FORM });
    setImages([]);
    setDeletedImageIds([]);
    setDocuments([]);
    setDeletedDocumentIds([]);
    setModels([]);
    setSheetOpen(true);
    loadMakes();
  };

  // ── Open sheet for editing ───────────────────────────────────
  const openEditSheet = async (car: Car) => {
    setSheetMode("edit");
    setEditCarId(car.id);
    setImages([]);
    setDeletedImageIds([]);
    setDocuments([]);
    setDeletedDocumentIds([]);
    setSheetOpen(true);
    setSheetLoading(true);
    loadMakes();

    try {
      const detail = await api.get<{
        id: number; make: string; model: string; year: number | null;
        color: string; licensePlate: string; vin: string; engine: string;
        fuelType: string; transmission: string; mileage: number; seats: number;
        dailyRate: number | null; status: string; notes: string;
        registrationExpiry: string; insuranceProvider: string;
        insurancePolicyNumber: string; insuranceExpiry: string;
        lastServiceDate: string; nextServiceDate: string;
        nextServiceMileage: number | null; repairParts: string[] | null;
        images: { id: number; url: string; isPrimary: boolean; sortOrder: number }[];
        documents?: { id: number; name: string; url: string; type: string; sortOrder: number }[];
      }>(`/cars/${car.id}`);

      if (detail.make) {
        try {
          const modelsData = await api.get<string[]>(`/data/car-models/${encodeURIComponent(detail.make)}`);
          setModels(modelsData);
        } catch { setModels([]); }
      }

      setForm({
        make: detail.make || "",
        model: detail.model || "",
        year: detail.year ? String(detail.year) : "",
        color: detail.color || "",
        licensePlate: detail.licensePlate || "",
        vin: detail.vin || "",
        engine: detail.engine || "",
        fuelType: detail.fuelType || "gasoline",
        transmission: detail.transmission || "automatic",
        mileage: detail.mileage ? String(detail.mileage) : "",
        seats: detail.seats ? String(detail.seats) : "5",
        dailyRate: detail.dailyRate ? String(detail.dailyRate) : "",
        status: detail.status || "available",
        notes: detail.notes || "",
        registrationExpiry: detail.registrationExpiry || "",
        insuranceProvider: detail.insuranceProvider || "",
        insurancePolicyNumber: detail.insurancePolicyNumber || "",
        insuranceExpiry: detail.insuranceExpiry || "",
        lastServiceDate: detail.lastServiceDate || "",
        nextServiceDate: detail.nextServiceDate || "",
        nextServiceMileage: detail.nextServiceMileage ? String(detail.nextServiceMileage) : "",
        repairParts: detail.repairParts || [],
      });

      setImages(
        (detail.images || [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((img) => ({ id: img.id, url: img.url, isPrimary: img.isPrimary })),
      );

      setDocuments(
        (detail.documents || [])
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((doc) => ({ id: doc.id, name: doc.name, url: doc.url, type: doc.type })),
      );
    } catch {
      toast.error(t("carDetail.failedLoad"));
      setSheetOpen(false);
    } finally {
      setSheetLoading(false);
    }
  };

  // ── Handle image changes (track deleted existing images) ─────
  const handleImageChange = (updated: ImageItem[]) => {
    const currentExistingIds = updated.filter((img) => img.id).map((img) => img.id!);
    const removedIds = images.filter((img) => img.id && !currentExistingIds.includes(img.id)).map((img) => img.id!);
    if (removedIds.length > 0) {
      setDeletedImageIds((prev) => [...prev, ...removedIds]);
    }
    setImages(updated);
  };

  // ── Handle document file selection ───────────────────────────
  const handleDocumentFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setDocuments((prev) => [...prev, {
        tempId: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        url,
        type: file.type || "application/octet-stream",
      }]);
    }
  };

  const handleRemoveDocument = (index: number) => {
    const doc = documents[index];
    if (doc.id) {
      setDeletedDocumentIds((prev) => [...prev, doc.id!]);
    }
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Create handler ───────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model) {
      toast.error(t("carsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      const carData = {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        mileage: form.mileage ? parseInt(form.mileage) : 0,
        seats: form.seats ? parseInt(form.seats) : 5,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : null,
        nextServiceMileage: form.nextServiceMileage ? parseInt(form.nextServiceMileage) : null,
        registrationExpiry: form.registrationExpiry || null,
        insuranceExpiry: form.insuranceExpiry || null,
        lastServiceDate: form.lastServiceDate || null,
        nextServiceDate: form.nextServiceDate || null,
        repairParts: form.status === "needs_repair" ? form.repairParts : null,
        images: images.map((img) => img.url),
        documents: documents.map((doc) => ({ name: doc.name, url: doc.url, type: doc.type })),
      };
      await api.post("/cars", carData);
      toast.success(t("carsPage.toast.added"));
      setForm({ ...EMPTY_FORM });
      setModels([]);
      setImages([]);
      setDocuments([]);
      setSheetOpen(false);
      fetchCars();
    } catch {
      toast.error(t("carsPage.toast.failedAdd"));
    } finally {
      setSaving(false);
    }
  };

  // ── Edit handler ─────────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make || !form.model || !editCarId) {
      toast.error(t("carsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      // 1. Delete removed images
      for (const imgId of deletedImageIds) {
        await api.delete(`/cars/images/${imgId}`);
      }

      // 2. Delete removed documents
      for (const docId of deletedDocumentIds) {
        await api.delete(`/cars/documents/${docId}`);
      }

      // 3. Collect new images (ones without an id)
      const newImageUrls = images.filter((img) => !img.id).map((img) => img.url);

      // 4. Collect new documents (ones without an id)
      const newDocs = documents.filter((doc) => !doc.id).map((doc) => ({ name: doc.name, url: doc.url, type: doc.type }));

      // 5. Update car fields + new images + new documents
      await api.put(`/cars/${editCarId}`, {
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
        nextServiceMileage: form.nextServiceMileage ? parseInt(form.nextServiceMileage) : null,
        repairParts: form.status === "needs_repair" ? form.repairParts : null,
        images: newImageUrls.length > 0 ? newImageUrls : undefined,
        documents: newDocs.length > 0 ? newDocs : undefined,
      });

      // 6. Update primary image if changed
      const primaryImg = images.find((img) => img.isPrimary && img.id);
      if (primaryImg?.id) {
        await api.put(`/cars/images/${primaryImg.id}/primary`, {});
      }

      // 7. Persist image sort order for existing images
      const existingImageIds = images.filter((img) => img.id).map((img) => img.id!);
      if (existingImageIds.length > 0) {
        await api.put(`/cars/${editCarId}/images/reorder`, { imageIds: existingImageIds });
      }

      toast.success(t("carEdit.saved"));
      setSheetOpen(false);
      fetchCars();
    } catch {
      toast.error(t("carEdit.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "available": return "default" as const;
      case "rented": return "destructive" as const;
      case "maintenance": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("carsPage.loadingCars")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("carsPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("carsPage.subtitle", { count: String(cars.length) })}
          </p>
        </div>
        <Button onClick={openCreateSheet}>{t("carsPage.addCar")}</Button>
      </div>

      {/* ── Shared Create / Edit Sheet ──────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
          <SheetHeader className="border-b">
            <SheetTitle>{sheetMode === "edit" ? t("carEdit.title") : t("carsPage.dialogTitle")}</SheetTitle>
            <SheetDescription>{sheetMode === "edit" ? `${form.make} ${form.model}${form.year ? ` (${form.year})` : ""}` : t("carsPage.dialogDescription")}</SheetDescription>
          </SheetHeader>
          {sheetLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-muted-foreground">{t("common.loading")}</div>
            </div>
          ) : (
            <form onSubmit={sheetMode === "edit" ? handleEdit : handleCreate} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Make */}
              <div className="space-y-2">
                <Label>{t("carsPage.make")} *</Label>
                <Select
                  value={form.make}
                  onValueChange={(val) => {
                    setForm({ ...form, make: val ?? "", model: "" });
                    if (val) loadModels(val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("carsPage.selectMake")} />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Model */}
              <div className="space-y-2">
                <Label>{t("carsPage.model")} *</Label>
                <Select
                  value={form.model}
                  onValueChange={(val) => setForm({ ...form, model: val ?? "" })}
                  disabled={!form.make}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={form.make ? t("carsPage.selectModel") : t("carsPage.selectMakeFirst")} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Year & License Plate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("carsPage.year")}</Label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label>{t("carsPage.licensePlate")}</Label>
                  <Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="01-234-AB" />
                </div>
              </div>
              {/* Color */}
              <div className="space-y-2">
                <Label>{t("carsPage.color")}</Label>
                <Select value={form.color} onValueChange={(val) => setForm({ ...form, color: val ?? "" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("carsPage.selectColor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {COLOR_KEYS.map((c) => (
                      <SelectItem key={c} value={c}>{t(`carsPage.colors.${c}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Fuel Type */}
              <div className="space-y-2">
                <Label>{t("carsPage.fuelType")}</Label>
                <Select value={form.fuelType} onValueChange={(val) => setForm({ ...form, fuelType: val ?? "gasoline" })}>
                  <SelectTrigger className="w-full"><SelectValue>{t(`carsPage.fuelTypes.${form.fuelType}`)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">{t("carsPage.fuelTypes.gasoline")}</SelectItem>
                    <SelectItem value="diesel">{t("carsPage.fuelTypes.diesel")}</SelectItem>
                    <SelectItem value="electric">{t("carsPage.fuelTypes.electric")}</SelectItem>
                    <SelectItem value="hybrid">{t("carsPage.fuelTypes.hybrid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Transmission */}
              <div className="space-y-2">
                <Label>{t("carsPage.transmission")}</Label>
                <Select value={form.transmission} onValueChange={(val) => setForm({ ...form, transmission: val ?? "automatic" })}>
                  <SelectTrigger className="w-full"><SelectValue>{t(`carsPage.transmissions.${form.transmission}`)}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">{t("carsPage.transmissions.automatic")}</SelectItem>
                    <SelectItem value="manual">{t("carsPage.transmissions.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Daily Rate */}
              <div className="space-y-2">
                <Label>{t("carsPage.dailyRate")}</Label>
                <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} placeholder="50" />
              </div>
              {/* VIN & Engine */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("carDetail.vin")}</Label>
                  <Input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("carDetail.engine")}</Label>
                  <Input value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} />
                </div>
              </div>
              {/* Seats & Mileage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("carDetail.seats")}</Label>
                  <Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("carDetail.mileage")}</Label>
                  <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="0" />
                </div>
              </div>
              {/* Status (edit only) */}
              {sheetMode === "edit" && (
                <>
                  <div className="space-y-2">
                    <Label>{t("carDetail.status")}</Label>
                    <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val ?? "available" })}>
                      <SelectTrigger className="w-full"><SelectValue>{t(`carsPage.statuses.${form.status}`)}</SelectValue></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t("carsPage.statuses.available")}</SelectItem>
                        <SelectItem value="rented">{t("carsPage.statuses.rented")}</SelectItem>
                        <SelectItem value="maintenance">{t("carsPage.statuses.maintenance")}</SelectItem>
                        <SelectItem value="out_of_service">{t("carsPage.statuses.out_of_service")}</SelectItem>
                        <SelectItem value="needs_repair">{t("carsPage.statuses.needs_repair")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.status === "needs_repair" && (
                    <div className="space-y-2">
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
                </>
              )}
              {/* Registration & Insurance */}
              <div className="space-y-2">
                <Label>{t("carDetail.registrationExpiry")}</Label>
                <DatePicker value={form.registrationExpiry} onChange={(val) => setForm({ ...form, registrationExpiry: val })} />
              </div>
              <div className="space-y-2">
                <Label>{t("carDetail.insuranceProvider")}</Label>
                <Input value={form.insuranceProvider} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("carDetail.policyNumber")}</Label>
                  <Input value={form.insurancePolicyNumber} onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("carDetail.insuranceExpiry")}</Label>
                  <DatePicker value={form.insuranceExpiry} onChange={(val) => setForm({ ...form, insuranceExpiry: val })} />
                </div>
              </div>
              {/* Service */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("carDetail.lastService")}</Label>
                  <DatePicker value={form.lastServiceDate} onChange={(val) => setForm({ ...form, lastServiceDate: val })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("carDetail.nextService")}</Label>
                  <DatePicker value={form.nextServiceDate} onChange={(val) => setForm({ ...form, nextServiceDate: val })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("carDetail.nextServiceMileage")}</Label>
                <Input type="number" value={form.nextServiceMileage} onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value })} />
              </div>
              {/* Notes */}
              <div className="space-y-2">
                <Label>{t("carDetail.notes")}</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder={t("carEdit.notesPlaceholder")} />
              </div>
              {/* Images */}
              <div className="space-y-2">
                <Label>{t("carEdit.images")}</Label>
                <ImageUpload images={images} onChange={sheetMode === "edit" ? handleImageChange : setImages} max={10} />
              </div>
              {/* Documents */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t("carDocuments.title")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("carDocuments.uploadHint")}</p>
                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
                      <div key={doc.id ?? doc.tempId ?? i} className="flex items-center gap-2 rounded-lg border p-2">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm">{doc.name}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleRemoveDocument(i)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => docInputRef.current?.click()}
                >
                  <Upload className="mr-1.5 h-4 w-4" />
                  {t("carDocuments.upload")}
                </Button>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { if (e.target.files) { handleDocumentFiles(e.target.files); e.target.value = ""; } }}
                />
              </div>
              </div>
              <SheetFooter className="border-t">
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? (sheetMode === "edit" ? t("carEdit.saving") : t("carsPage.adding"))
                    : (sheetMode === "edit" ? t("carEdit.saveChanges") : t("carsPage.addCarBtn"))
                  }
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <DataTable<Car>
        data={cars}
        columns={[
          {
            key: "car",
            header: t("carsPage.tableHeaders.car"),
            sortValue: (c) => `${c.make} ${c.model}`,
            render: (c) => {
              const colorKey = c.color ? c.color.toLowerCase() : "";
              const colorTranslation = colorKey ? t(`carsPage.colors.${colorKey}`) : "";
              const colorDisplay = colorTranslation.startsWith("carsPage.") ? c.color : colorTranslation;
              return (
              <div>
                <span className="font-medium">{c.make} {c.model}</span>
                <span className="ml-1 text-muted-foreground">
                  {c.year ? `(${c.year})` : ""}
                  {c.color ? ` · ${colorDisplay}` : ""}
                </span>
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
        ]}
        getRowId={(c) => c.id}
        searchFn={(c, q) =>
          `${c.make} ${c.model} ${c.licensePlate} ${c.color} ${c.status}`.toLowerCase().includes(q)
        }
        actions={[
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
        ]}
        emptyMessage={t("carsPage.emptyState")}
        defaultSortKey="car"
        onRowClick={(c) => router.push(`/dashboard/cars/${c.id}`)}
      />
    </div>
  );
}
