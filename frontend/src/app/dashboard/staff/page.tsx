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
  Card,
  CardContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function StaffPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "regular",
    phone: "",
  });

  const subdomain = typeof window !== "undefined" ? localStorage.getItem("staff_subdomain") || "" : "";

  const fetchStaff = async () => {
    try {
      const data = await api.get<StaffMember[]>(`/staff?subdomain=${subdomain}`);
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      // If not authorized (regular user), redirect
      if (err instanceof Error && err.message.includes("403")) {
        router.push("/dashboard");
        return;
      }
      toast.error(t("staffPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error(t("staffPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      await api.post(`/staff?subdomain=${subdomain}`, form);
      toast.success(t("staffPage.toast.added"));
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "regular",
        phone: "",
      });
      setDialogOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("staffPage.toast.failedAdd"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (staffMember: StaffMember) => {
    try {
      await api.put(`/staff/${staffMember.id}?subdomain=${subdomain}`, {
        isActive: !staffMember.isActive,
      });
      toast.success(staffMember.isActive ? t("staffPage.toast.deactivated") : t("staffPage.toast.activated"));
      fetchStaff();
    } catch {
      toast.error(t("staffPage.toast.failedUpdate"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("staffPage.loadingStaff")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("staffPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("staffPage.subtitle", { count: String(staff.length) })}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button>{t("staffPage.addStaff")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("staffPage.dialogTitle")}</DialogTitle>
              <DialogDescription>{t("staffPage.dialogDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("staffPage.firstName")} *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("staffPage.lastName")} *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("staffPage.email")} *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("staffPage.password")} *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("staffPage.role")}</Label>
                  <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val ?? "regular" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t("roles.manager")}</SelectItem>
                      <SelectItem value="regular">{t("roles.regular")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("staffPage.phone")}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={saving}>{saving ? t("staffPage.adding") : t("staffPage.addStaffBtn")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {staff.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t("staffPage.emptyState")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("staffPage.tableHeaders.name")}</TableHead>
                  <TableHead>{t("staffPage.tableHeaders.email")}</TableHead>
                  <TableHead>{t("staffPage.tableHeaders.role")}</TableHead>
                  <TableHead>{t("staffPage.tableHeaders.status")}</TableHead>
                  <TableHead>{t("staffPage.tableHeaders.lastLogin")}</TableHead>
                  <TableHead>{t("staffPage.tableHeaders.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.firstName} {s.lastName}
                    </TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Badge variant={s.role === "manager" ? "default" : "secondary"}>
                        {s.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "default" : "destructive"}>
                        {s.isActive ? t("common.active") : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : t("common.never")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={s.isActive ? "destructive" : "default"}
                        onClick={() => toggleActive(s)}
                      >
                        {s.isActive ? t("common.deactivate") : t("common.activate")}
                      </Button>
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
