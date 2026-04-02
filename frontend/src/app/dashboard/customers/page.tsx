"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { DataTable, Eye, Pencil, Trash2 } from "@/components/data-table";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  driversLicense: string;
  dateOfBirth: string;
  address: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idNumber: "",
    driversLicense: "",
    dateOfBirth: "",
    address: "",
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) {
      toast.error(t("customersPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      await api.post("/customers", form);
      toast.success(t("customersPage.toast.created"));
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        idNumber: "",
        driversLicense: "",
        dateOfBirth: "",
        address: "",
      });
      setDialogOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("customersPage.toast.failedCreate"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("customersPage.loadingCustomers")}</div>
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>{t("customersPage.newCustomer")}</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("customersPage.dialogTitle")}</DialogTitle>
              <DialogDescription>{t("customersPage.dialogDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.firstName")} *</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.lastName")} *</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.email")}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.phone")} *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.idNumber")}</Label>
                  <Input
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.driversLicense")}</Label>
                  <Input
                    value={form.driversLicense}
                    onChange={(e) => setForm({ ...form, driversLicense: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.dateOfBirth")}</Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.address")}</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? t("customersPage.creating") : t("customersPage.createCustomer")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable<Customer>
        data={customers}
        columns={[
          {
            key: "name",
            header: t("customersPage.tableHeaders.name"),
            sortValue: (c) => `${c.firstName} ${c.lastName}`,
            render: (c) => <span className="font-medium">{c.firstName} {c.lastName}</span>,
          },
          {
            key: "phone",
            header: t("customersPage.tableHeaders.phone"),
            sortValue: (c) => c.phone,
            render: (c) => <span>{c.phone}</span>,
          },
          {
            key: "email",
            header: t("customersPage.tableHeaders.email"),
            sortValue: (c) => c.email || "",
            render: (c) => <span className="text-muted-foreground">{c.email || "—"}</span>,
          },
          {
            key: "idLicense",
            header: t("customersPage.tableHeaders.idLicense"),
            sortable: false,
            render: (c) => (
              <div className="flex flex-wrap gap-1">
                {c.idNumber && <Badge variant="outline" className="text-xs">ID: {c.idNumber}</Badge>}
                {c.driversLicense && <Badge variant="outline" className="text-xs">DL: {c.driversLicense}</Badge>}
                {!c.idNumber && !c.driversLicense && <span className="text-muted-foreground">—</span>}
              </div>
            ),
          },
          {
            key: "registered",
            header: t("customersPage.tableHeaders.registered"),
            sortValue: (c) => new Date(c.createdAt).getTime(),
            render: (c) => (
              <span className="text-sm text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        getRowId={(c) => c.id}
        searchFn={(c, q) =>
          `${c.firstName} ${c.lastName} ${c.phone} ${c.email} ${c.idNumber}`.toLowerCase().includes(q)
        }
        actions={[
          {
            label: t("common.view"),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => {},
          },
          {
            label: t("common.edit"),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => {},
          },
          {
            label: t("common.delete"),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: async (c) => {
              if (!confirm(t("common.confirmDelete"))) return;
              try {
                await api.delete(`/customers/${c.id}`);
                toast.success(t("common.deleted"));
                fetchCustomers();
              } catch {
                toast.error(t("common.failedDelete"));
              }
            },
            variant: "destructive",
          },
        ]}
        emptyMessage={t("customersPage.emptyState")}
        defaultSortKey="name"
      />
    </div>
  );
}
