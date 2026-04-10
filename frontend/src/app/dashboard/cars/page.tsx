"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";

import type { Car } from "./_components/types";
import { CarSheet } from "./_components/car-sheet";
import { getCarColumns, getCarActions } from "./_components/car-table-columns";
import { useCarSheet } from "./_components/use-car-sheet";

export default function CarsPage() {
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

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

  const sheet = useCarSheet(t, fetchCars);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
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
        <Button onClick={sheet.openCreateSheet}>{t("carsPage.addCar")}</Button>
      </div>

      <CarSheet
        open={sheet.sheetOpen}
        onOpenChange={sheet.setSheetOpen}
        sheetMode={sheet.sheetMode}
        sheetLoading={sheet.sheetLoading}
        saving={sheet.saving}
        form={sheet.form}
        setForm={sheet.setForm}
        makes={sheet.makes}
        models={sheet.models}
        loadModels={sheet.loadModels}
        images={sheet.images}
        documents={sheet.documents}
        onImageChange={sheet.sheetMode === "edit" ? sheet.handleImageChange : sheet.setImages}
        onDocumentFiles={sheet.handleDocumentFiles}
        onRemoveDocument={sheet.handleRemoveDocument}
        docInputRef={sheet.docInputRef}
        onSubmit={sheet.handleSubmit}
        t={t}
      />

      <DataTable<Car>
        data={cars}
        columns={getCarColumns(t, fc)}
        getRowId={(c) => c.id}
        searchFn={(c, q) =>
          `${c.make} ${c.model} ${c.licensePlate} ${c.color} ${c.status}`.toLowerCase().includes(q)
        }
        actions={getCarActions(t, router, sheet.openEditSheet, fetchCars)}
        emptyMessage={t("carsPage.emptyState")}
        defaultSortKey="car"
        onRowClick={(c) => router.push(`/dashboard/cars/${c.id}`)}
      />
    </div>
  );
}
