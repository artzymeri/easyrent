"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

  const subdomain = typeof window !== "undefined" ? localStorage.getItem("staff_subdomain") || "" : "";

  const fetchCustomers = async () => {
    try {
      const data = await api.get<{ rows: Customer[] }>(`/customers?subdomain=${subdomain}`);
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
      await api.post(`/customers?subdomain=${subdomain}`, form);
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
          <DialogTrigger>
            <Button>{t("customersPage.newCustomer")}</Button>
          </DialogTrigger>
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

      <Card>
        <CardContent className="pt-6">
          {customers.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t("customersPage.emptyState")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("customersPage.tableHeaders.name")}</TableHead>
                  <TableHead>{t("customersPage.tableHeaders.phone")}</TableHead>
                  <TableHead>{t("customersPage.tableHeaders.email")}</TableHead>
                  <TableHead>{t("customersPage.tableHeaders.idLicense")}</TableHead>
                  <TableHead>{t("customersPage.tableHeaders.registered")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.firstName} {c.lastName}
                    </TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>
                      {c.idNumber && <Badge variant="outline" className="mr-1">ID: {c.idNumber}</Badge>}
                      {c.driversLicense && <Badge variant="outline">DL: {c.driversLicense}</Badge>}
                      {!c.idNumber && !c.driversLicense && "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
