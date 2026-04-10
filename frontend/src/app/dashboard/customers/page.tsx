"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/data-table";
import { FilterBar, type FilterConfig } from "@/components/filter-bar";
import { toast } from "sonner";

import type { Customer, CustomerForm, DocumentItem } from "./_components/types";
import { EMPTY_FORM } from "./_components/types";
import { CustomerFormSheet } from "./_components/customer-form-sheet";
import { useCustomerColumns, useCustomerActions } from "./_components/customer-table-config";

interface FiltersData {
  cities: string[];
  countries: string[];
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersData, setFiltersData] = useState<FiltersData>({ cities: [], countries: [] });

  // Filter state
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | "view">("create");
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerForm>({ ...EMPTY_FORM });

  // Document upload state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [extracting, setExtracting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterValues.city) params.append("city", filterValues.city);
      if (filterValues.country) params.append("country", filterValues.country);
      if (filterValues.hasEmail) params.append("hasEmail", filterValues.hasEmail);
      
      const queryString = params.toString();
      const data = await api.get<{
        rows: Customer[];
        count: number;
        filters: FiltersData;
      }>(`/customers${queryString ? `?${queryString}` : ""}`);
      
      setCustomers(data.rows || []);
      setTotalCount(data.count || 0);
      setFiltersData(data.filters || { cities: [], countries: [] });
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  }, [search, filterValues, t]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setSearch("");
  };

  // Build filter config from server data
  const filterConfigs: FilterConfig[] = [
    {
      key: "city",
      label: t("customersPage.city"),
      type: "select",
      options: filtersData.cities.map((c) => ({ value: c, label: c })),
    },
    {
      key: "country",
      label: t("customersPage.country"),
      type: "select",
      options: filtersData.countries.map((c) => ({ value: c, label: c })),
    },
    {
      key: "hasEmail",
      label: t("customersPage.hasEmail"),
      type: "boolean",
    },
  ];

  const populateFormFromDetail = (detail: Customer) => {
    setForm({
      firstName: detail.firstName || "",
      lastName: detail.lastName || "",
      email: detail.email || "",
      phone: detail.phone || "",
      idNumber: detail.idNumber || "",
      personalNumber: detail.personalNumber || "",
      driversLicense: detail.driversLicense || "",
      driversLicenseExpiry: detail.driversLicenseExpiry || "",
      dateOfBirth: detail.dateOfBirth || "",
      address: detail.address || "",
      city: detail.city || "",
      country: detail.country || "",
      notes: detail.notes || "",
    });
    setDocuments(detail.documents || []);
  };

  // ── Open sheet for creating ──────────────────────────────────
  const openCreateSheet = () => {
    setSheetMode("create");
    setEditCustomerId(null);
    setForm({ ...EMPTY_FORM });
    setDocuments([]);
    setSheetOpen(true);
  };

  // ── Open sheet for editing ───────────────────────────────────
  const openEditSheet = async (customer: Customer) => {
    setSheetMode("edit");
    setEditCustomerId(customer.id);
    setSheetOpen(true);
    try {
      const detail = await api.get<Customer>(`/customers/${customer.id}`);
      populateFormFromDetail(detail);
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
      setSheetOpen(false);
    }
  };

  // ── Open sheet for viewing ───────────────────────────────────
  const openViewSheet = async (customer: Customer) => {
    setSheetMode("view");
    setEditCustomerId(customer.id);
    setSheetOpen(true);
    try {
      const detail = await api.get<Customer>(`/customers/${customer.id}`);
      populateFormFromDetail(detail);
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
      setSheetOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetMode === "edit") {
      if (!form.firstName || !form.lastName || !editCustomerId) {
        toast.error(t("customersPage.validation.required"));
        return;
      }
      setSaving(true);
      try {
        await api.put(`/customers/${editCustomerId}`, { ...form, documents });
        toast.success(t("customersPage.toast.updated"));
        setSheetOpen(false);
        fetchCustomers();
      } catch {
        toast.error(t("customersPage.toast.failedUpdate"));
      } finally {
        setSaving(false);
      }
    } else {
      if (!form.firstName || !form.lastName || !form.phone) {
        toast.error(t("customersPage.validation.required"));
        return;
      }
      setSaving(true);
      try {
        await api.post("/customers", { ...form, documents });
        toast.success(t("customersPage.toast.created"));
        setForm({ ...EMPTY_FORM });
        setDocuments([]);
        setSheetOpen(false);
        fetchCustomers();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("already exists")) {
          toast.error(t("customersPage.toast.alreadyExists"));
        } else {
          toast.error(t("customersPage.toast.failedCreate"));
        }
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`/customers/${c.id}`);
      toast.success(t("common.deleted"));
      fetchCustomers();
    } catch {
      toast.error(t("common.failedDelete"));
    }
  };

  const columns = useCustomerColumns();
  const actions = useCustomerActions({
    onView: openViewSheet,
    onEdit: openEditSheet,
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("customersPage.title")}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("customersPage.subtitle", { count: String(totalCount) })}
          </p>
        </div>
        <Button onClick={openCreateSheet} className="w-full sm:w-auto">{t("customersPage.newCustomer")}</Button>
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

      <CustomerFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        form={form}
        setForm={setForm}
        documents={documents}
        setDocuments={setDocuments}
        extracting={extracting}
        setExtracting={setExtracting}
        saving={saving}
        onSubmit={handleSubmit}
        onSwitchToEdit={() => setSheetMode("edit")}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <DataTable<Customer>
          data={customers}
          columns={columns}
          getRowId={(c) => c.id}
          actions={actions}
          emptyMessage={t("customersPage.emptyState")}
          defaultSortKey="name"
          onRowClick={(c) => openViewSheet(c)}
          hideSearch
        />
      )}
    </div>
  );
}
