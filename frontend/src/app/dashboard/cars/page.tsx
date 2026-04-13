"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/data-table";
import { FilterBar, type FilterConfig } from "@/components/filter-bar";
import { toast } from "sonner";

import type { Car, CarColor, InsuranceProviderOption } from "./_components/types";
import { CarSheet } from "./_components/car-sheet";
import { getCarColumns, getCarActions } from "./_components/car-table-columns";
import { useCarSheet } from "./_components/use-car-sheet";

interface FiltersData {
  makes: string[];
  colors: string[];
  carColors: CarColor[];
  fuelTypes: string[];
  transmissions: string[];
  statuses: string[];
}

export default function CarsPage() {
  const { t, locale } = useTranslation();
  const { fc } = useCurrency();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersData, setFiltersData] = useState<FiltersData>({
    makes: [],
    colors: [],
    carColors: [],
    fuelTypes: [],
    transmissions: [],
    statuses: ["available", "rented", "maintenance"],
  });

  // Filter state
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProviderOption[]>([]);

  const fetchInsuranceProviders = useCallback(async () => {
    try {
      const data = await api.get<InsuranceProviderOption[]>("/insurance-providers");
      setInsuranceProviders(data);
    } catch { /* ignore */ }
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterValues.status) params.append("status", filterValues.status);
      if (filterValues.make) params.append("make", filterValues.make);
      if (filterValues.fuelType) params.append("fuelType", filterValues.fuelType);
      if (filterValues.transmission) params.append("transmission", filterValues.transmission);
      if (filterValues.color) params.append("color", filterValues.color);
      
      const queryString = params.toString();
      const data = await api.get<{
        rows: Car[];
        count: number;
        filters: FiltersData;
      }>(`/cars${queryString ? `?${queryString}` : ""}`);
      
      setCars(data.rows || []);
      setTotalCount(data.count || 0);
      setFiltersData(data.filters || filtersData);
    } catch {
      toast.error(t("carsPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  }, [search, filterValues, t]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCars]);

  useEffect(() => {
    fetchInsuranceProviders();
  }, [fetchInsuranceProviders]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setSearch("");
  };

  const sheet = useCarSheet(t, fetchCars, filtersData.carColors, insuranceProviders);

  // Build filter config
  const statusLabels: Record<string, string> = {
    available: t("carsPage.statusAvailable"),
    rented: t("carsPage.statusRented"),
    maintenance: t("carsPage.statusMaintenance"),
  };

  // Helper for localized color names
  const getColorName = (color: CarColor) => locale === "sq" ? color.nameSq : color.nameEn;

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: t("carsPage.status"),
      type: "select",
      options: filtersData.statuses.map((s) => ({ value: s, label: statusLabels[s] || s })),
    },
    {
      key: "make",
      label: t("carsPage.make"),
      type: "select",
      options: filtersData.makes.map((m) => ({ value: m, label: m })),
    },
    {
      key: "fuelType",
      label: t("carsPage.fuelType"),
      type: "select",
      options: filtersData.fuelTypes.map((f) => ({ value: f, label: f })),
    },
    {
      key: "transmission",
      label: t("carsPage.transmission"),
      type: "select",
      options: filtersData.transmissions.map((t) => ({ value: t, label: t })),
    },
    {
      key: "color",
      label: t("carsPage.color"),
      type: "select",
      options: filtersData.carColors.map((c) => ({ value: String(c.id), label: getColorName(c) })),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("carsPage.title")}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("carsPage.subtitle", { count: String(totalCount) })}
          </p>
        </div>
        <Button onClick={sheet.openCreateSheet} className="w-full sm:w-auto">{t("carsPage.addCar")}</Button>
      </div>

      <FilterBar
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("common.search")}
      />

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
        carColors={sheet.carColors}
        insuranceProviders={sheet.insuranceProviders}
        loadModels={sheet.loadModels}
        images={sheet.images}
        documents={sheet.documents}
        onImageChange={sheet.sheetMode === "edit" ? sheet.handleImageChange : sheet.setImages}
        onDocumentFiles={sheet.handleDocumentFiles}
        onRemoveDocument={sheet.handleRemoveDocument}
        docInputRef={sheet.docInputRef}
        onSubmit={sheet.handleSubmit}
        t={t}
        locale={locale}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <DataTable<Car>
          data={cars}
          columns={getCarColumns(t, fc, locale)}
          getRowId={(c) => c.id}
          actions={getCarActions(t, router, sheet.openEditSheet, fetchCars)}
          emptyMessage={t("carsPage.emptyState")}
          defaultSortKey="car"
          onRowClick={(c) => router.push(`/dashboard/cars/${c.id}`)}
          hideSearch
        />
      )}
    </div>
  );
}
