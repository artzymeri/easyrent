"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable, Eye, Pencil, Trash2, type Column, type DataTableAction } from "@/components/data-table";
import { ImageUpload, type ImageItem } from "@/components/image-upload";

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

export default function CarsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImageItem[]>([]);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    engine: "",
    fuelType: "gasoline",
    transmission: "automatic",
    mileage: "",
    seats: "5",
    dailyRate: "",
  });

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
        images: newImages.map((img) => img.url),
      };
      await api.post("/cars", carData);
      toast.success(t("carsPage.toast.added"));
      setForm({
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        engine: "",
        fuelType: "gasoline",
        transmission: "automatic",
        mileage: "",
        seats: "5",
        dailyRate: "",
      });
      setModels([]);
      setNewImages([]);
      setDialogOpen(false);
      fetchCars();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("carsPage.toast.failedAdd"));
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
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (open) loadMakes(); }}>
          <DialogTrigger render={<Button />}>{t("carsPage.addCar")}</DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("carsPage.dialogTitle")}</DialogTitle>
              <DialogDescription>{t("carsPage.dialogDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
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
                      <SelectValue placeholder={t("carsPage.selectMake")} />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("carsPage.model")} *</Label>
                  <Select
                    value={form.model}
                    onValueChange={(val) => setForm({ ...form, model: val ?? "" })}
                    disabled={!form.make}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.make ? t("carsPage.selectModel") : t("carsPage.selectMakeFirst")} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("carsPage.year")}</Label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label>{t("carsPage.color")}</Label>
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Black" />
                </div>
                <div className="space-y-2">
                  <Label>{t("carsPage.licensePlate")}</Label>
                  <Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="01-234-AB" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("carsPage.fuelType")}</Label>
                  <Select value={form.fuelType} onValueChange={(val) => setForm({ ...form, fuelType: val ?? "gasoline" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">{t("carsPage.fuelTypes.gasoline")}</SelectItem>
                      <SelectItem value="diesel">{t("carsPage.fuelTypes.diesel")}</SelectItem>
                      <SelectItem value="electric">{t("carsPage.fuelTypes.electric")}</SelectItem>
                      <SelectItem value="hybrid">{t("carsPage.fuelTypes.hybrid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("carsPage.transmission")}</Label>
                  <Select value={form.transmission} onValueChange={(val) => setForm({ ...form, transmission: val ?? "automatic" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">{t("carsPage.transmissions.automatic")}</SelectItem>
                      <SelectItem value="manual">{t("carsPage.transmissions.manual")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("carsPage.dailyRate")}</Label>
                  <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} placeholder="50" />
                </div>
              </div>
              {/* Images */}
              <div className="space-y-2">
                <Label>{t("carEdit.images")}</Label>
                <ImageUpload images={newImages} onChange={setNewImages} max={10} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={saving}>{saving ? t("carsPage.adding") : t("carsPage.addCarBtn")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Car>
        data={cars}
        columns={[
          {
            key: "car",
            header: t("carsPage.tableHeaders.car"),
            sortValue: (c) => `${c.make} ${c.model}`,
            render: (c) => (
              <div>
                <span className="font-medium">{c.make} {c.model}</span>
                <span className="ml-1 text-muted-foreground">
                  {c.year ? `(${c.year})` : ""}
                  {c.color ? ` · ${c.color}` : ""}
                </span>
              </div>
            ),
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
              <span className="capitalize">{c.fuelType} / {c.transmission}</span>
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
              <span>{c.dailyRate ? `$${Number(c.dailyRate).toFixed(2)}/day` : "—"}</span>
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
            onClick: (c) => router.push(`/dashboard/cars/${c.id}/edit`),
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
      />
    </div>
  );
}
