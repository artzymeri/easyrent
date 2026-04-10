"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";

import type { Customer, CustomerForm, DocumentItem } from "./_components/types";
import { EMPTY_FORM } from "./_components/types";
import { CustomerFormSheet } from "./_components/customer-form-sheet";
import { useCustomerColumns, useCustomerActions } from "./_components/customer-table-config";

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | "view">("create");
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CustomerForm>({ ...EMPTY_FORM });

  // Document upload state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [extracting, setExtracting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const data = await api.get<{ rows: Customer[] }>("/customers");
      setCustomers(data.rows || []);
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">{t("customersPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("customersPage.subtitle", { count: String(customers.length) })}
          </p>
        </div>
        <Button onClick={openCreateSheet}>{t("customersPage.newCustomer")}</Button>
      </div>

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

      <DataTable<Customer>
        data={customers}
        columns={columns}
        getRowId={(c) => c.id}
        searchFn={(c, q) =>
          `${c.firstName} ${c.lastName} ${c.phone} ${c.email} ${c.idNumber} ${c.personalNumber}`
            .toLowerCase()
            .includes(q)
        }
        actions={actions}
        emptyMessage={t("customersPage.emptyState")}
        defaultSortKey="name"
        onRowClick={(c) => openViewSheet(c)}
      />
    </div>
  );
}
