import { useState, useRef } from "react";
import { api } from "@/lib/api";
import type { ImageItem } from "@/components/image-upload";
import { toast } from "sonner";

import type { Car, CarFormData, DocumentItem, CarColor, InsuranceProviderOption } from "./types";
import { EMPTY_FORM } from "./types";
type TFunc = (key: string, opts?: Record<string, string>) => string;

export function useCarSheet(t: TFunc, fetchCars: () => Promise<void>, carColors: CarColor[] = [], insuranceProviders: InsuranceProviderOption[] = []) {
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
  const [form, setForm] = useState<CarFormData>({ ...EMPTY_FORM });

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
    // Only reset form if switching from edit mode
    if (sheetMode === "edit") {
      setForm({ ...EMPTY_FORM });
      setImages([]);
      setDocuments([]);
      setModels([]);
    }
    setSheetMode("create");
    setEditCarId(null);
    setDeletedImageIds([]);
    setDeletedDocumentIds([]);
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
        color: string; colorId: number | null; licensePlate: string; vin: string; engine: string;
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
        colorId: detail.colorId ? String(detail.colorId) : "",
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

  // ── Submit handler (create or edit) ──────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetMode === "edit") {
      await handleEdit();
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    if (!form.make || !form.model) {
      toast.error(t("carsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      const carData = {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        colorId: form.colorId ? parseInt(form.colorId) : null,
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

  const handleEdit = async () => {
    if (!form.make || !form.model || !editCarId) {
      toast.error(t("carsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      for (const imgId of deletedImageIds) {
        await api.delete(`/cars/images/${imgId}`);
      }
      for (const docId of deletedDocumentIds) {
        await api.delete(`/cars/documents/${docId}`);
      }
      const newImageUrls = images.filter((img) => !img.id).map((img) => img.url);
      const newDocs = documents.filter((doc) => !doc.id).map((doc) => ({ name: doc.name, url: doc.url, type: doc.type }));

      await api.put(`/cars/${editCarId}`, {
        make: form.make, model: form.model,
        year: form.year ? parseInt(form.year) : null,
        color: form.color || null,
        colorId: form.colorId ? parseInt(form.colorId) : null,
        licensePlate: form.licensePlate || null,
        vin: form.vin || null, engine: form.engine || null,
        fuelType: form.fuelType, transmission: form.transmission,
        mileage: form.mileage ? parseInt(form.mileage) : 0,
        seats: form.seats ? parseInt(form.seats) : 5,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : null,
        status: form.status, notes: form.notes || null,
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

      const primaryImg = images.find((img) => img.isPrimary && img.id);
      if (primaryImg?.id) {
        await api.put(`/cars/images/${primaryImg.id}/primary`, {});
      }
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
  return {
    sheetOpen, setSheetOpen, sheetMode, sheetLoading, saving,
    form, setForm, makes, models, loadModels, carColors, insuranceProviders,
    images, setImages, documents, docInputRef,
    openCreateSheet, openEditSheet,
    handleImageChange, handleDocumentFiles, handleRemoveDocument, handleSubmit,
  };
}
