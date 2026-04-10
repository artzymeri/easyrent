"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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
import { DataTable, Pencil, Trash2 } from "@/components/data-table";
import { FilterBar, type FilterConfig } from "@/components/filter-bar";
import { UserCheck, UserX } from "lucide-react";

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

interface StaffResponse {
  rows: StaffMember[];
  count: number;
  filters: {
    roles: string[];
    statuses: { value: string; label: string }[];
  };
}

export default function StaffPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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

  // Filter state
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterValues.role) params.append("role", filterValues.role);
      if (filterValues.isActive) params.append("isActive", filterValues.isActive);
      
      const queryString = params.toString();
      const data = await api.get<StaffResponse>(`/staff${queryString ? `?${queryString}` : ""}`);
      
      setStaff(data.rows || []);
      setTotalCount(data.count || 0);
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
  }, [search, filterValues, router, t]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStaff]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setSearch("");
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: "role",
      label: t("staffPage.tableHeaders.role"),
      type: "select",
      options: [
        { value: "manager", label: t("roles.manager") },
        { value: "regular", label: t("roles.regular") },
      ],
    },
    {
      key: "isActive",
      label: t("staffPage.tableHeaders.status"),
      type: "select",
      options: [
        { value: "true", label: t("common.active") },
        { value: "false", label: t("common.inactive") },
      ],
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error(t("staffPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      await api.post("/staff", form);
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
    } catch {
      toast.error(t("staffPage.toast.failedAdd"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (staffMember: StaffMember) => {
    try {
      await api.put(`/staff/${staffMember.id}`, {
        isActive: !staffMember.isActive,
      });
      toast.success(staffMember.isActive ? t("staffPage.toast.deactivated") : t("staffPage.toast.activated"));
      fetchStaff();
    } catch {
      toast.error(t("staffPage.toast.failedUpdate"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("staffPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("staffPage.subtitle", { count: String(totalCount) })}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>{t("staffPage.addStaff")}</DialogTrigger>
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
                    <SelectTrigger><SelectValue placeholder={t(`roles.${form.role}`)} /></SelectTrigger>
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

      <FilterBar
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("common.search")}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <DataTable<StaffMember>
          data={staff}
          columns={[
            {
              key: "name",
              header: t("staffPage.tableHeaders.name"),
              sortValue: (s) => `${s.firstName} ${s.lastName}`,
              render: (s) => <span className="font-medium">{s.firstName} {s.lastName}</span>,
            },
            {
              key: "email",
              header: t("staffPage.tableHeaders.email"),
              sortValue: (s) => s.email,
              render: (s) => <span className="text-muted-foreground">{s.email}</span>,
            },
            {
              key: "role",
              header: t("staffPage.tableHeaders.role"),
              sortValue: (s) => s.role,
              render: (s) => (
                <Badge variant={s.role === "manager" ? "default" : "secondary"}>
                  {t(`roles.${s.role}`)}
                </Badge>
              ),
            },
            {
              key: "status",
              header: t("staffPage.tableHeaders.status"),
              sortValue: (s) => (s.isActive ? 1 : 0),
              render: (s) => (
                <Badge variant={s.isActive ? "default" : "destructive"}>
                  {s.isActive ? t("common.active") : t("common.inactive")}
                </Badge>
              ),
            },
            {
              key: "lastLogin",
              header: t("staffPage.tableHeaders.lastLogin"),
              sortValue: (s) => s.lastLoginAt ? new Date(s.lastLoginAt).getTime() : 0,
              render: (s) => (
                <span className="text-sm text-muted-foreground">
                  {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : t("common.never")}
                </span>
              ),
            },
          ]}
          getRowId={(s) => s.id}
          actions={[
            {
              label: t("common.edit"),
              icon: <Pencil className="h-4 w-4" />,
              onClick: () => {},
            },
            {
              label: t("common.activate"),
              icon: <UserCheck className="h-4 w-4" />,
              onClick: (s) => toggleActive(s),
              hidden: (s) => s.isActive,
            },
            {
              label: t("common.deactivate"),
              icon: <UserX className="h-4 w-4" />,
              onClick: (s) => toggleActive(s),
              variant: "destructive",
              hidden: (s) => !s.isActive,
            },
          ]}
          emptyMessage={t("staffPage.emptyState")}
          defaultSortKey="name"
          hideSearch
        />
      )}
    </div>
  );
}
