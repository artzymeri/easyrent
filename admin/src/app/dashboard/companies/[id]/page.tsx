"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogoCropper } from "@/components/logo-cropper";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Camera,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  Users,
  Car,
  X,
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  subdomain: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  logoUrl: string | null;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  staff?: StaffMember[];
  cars?: CarItem[];
}

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface CarItem {
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
  images?: { id: number; url: string; isPrimary: boolean }[];
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const data = await api.get<Company>(`/companies/${id}`);
      setCompany(data);
      setStaff(data.staff || []);
      setCars(data.cars || []);
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        isActive: data.isActive,
      });
    } catch {
      toast.error("Failed to load company");
      router.push("/dashboard/companies");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-enable edit mode when ?edit=true is in URL
  useEffect(() => {
    if (!loading && company && searchParams.get("edit") === "true") {
      setEditing(true);
    }
  }, [loading, company, searchParams]);

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const updated = await api.put<Company>(`/companies/${id}`, editForm);
      setCompany({ ...company, ...updated });
      setEditing(false);
      toast.success("Company updated successfully");
    } catch {
      toast.error("Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/companies/${id}`);
      toast.success("Company deleted successfully");
      router.push("/dashboard/companies");
    } catch {
      toast.error("Failed to delete company");
      setDeleting(false);
    }
  };

  const handleLogoSave = async (base64: string) => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { logoUrl: base64 });
      setCompany({ ...company, logoUrl: base64 });
      toast.success("Logo updated successfully");
    } catch {
      toast.error("Failed to update logo");
    }
  };

  const handleRemoveLogo = async () => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { logoUrl: null });
      setCompany({ ...company, logoUrl: null });
      toast.success("Logo removed");
    } catch {
      toast.error("Failed to remove logo");
    }
  };

  const toggleCompanyStatus = async () => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { isActive: !company.isActive });
      setCompany({ ...company, isActive: !company.isActive });
      setEditForm((f) => ({ ...f, isActive: !company.isActive }));
      toast.success(
        company.isActive ? "Company deactivated" : "Company activated"
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!company) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "rented":
        return "destructive";
      case "maintenance":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="group relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-muted bg-muted/50">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => setLogoCropperOpen(true)}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {company.name}
              </h1>
              <Badge variant={company.isActive ? "default" : "destructive"}>
                {company.isActive ? "Active" : "Inactive"}
              </Badge>
              {!company.onboardingCompleted && (
                <Badge variant="secondary">Onboarding Incomplete</Badge>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {company.subdomain}
              </code>
              <span className="text-sm">.easyrent.com</span>
            </p>
            {(company.city || company.country) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {company.city}
                {company.country ? `, ${company.country}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/companies")}
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back
          </Button>
          {!editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant={company.isActive ? "destructive" : "default"}
                size="sm"
                onClick={toggleCompanyStatus}
              >
                {company.isActive ? "Deactivate" : "Activate"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Company</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete{" "}
                      <strong>{company.name}</strong>? This will permanently
                      remove the company, all staff, cars, and bookings. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting…" : "Delete Company"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setEditForm({
                    name: company.name || "",
                    email: company.email || "",
                    phone: company.phone || "",
                    address: company.address || "",
                    city: company.city || "",
                    country: company.country || "",
                    isActive: company.isActive,
                  });
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-1 h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Company Details</CardTitle>
            <CardDescription>
              Update company information. Subdomain cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="company@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, city: e.target.value }))
                  }
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, country: e.target.value }))
                  }
                  placeholder="Country"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="Full address"
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.isActive}
                  onCheckedChange={(val) =>
                    setEditForm((f) => ({ ...f, isActive: val as boolean }))
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Staff
                </CardDescription>
                <CardTitle className="text-2xl">{staff.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {staff.filter((s) => s.isActive).length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Cars
                </CardDescription>
                <CardTitle className="text-2xl">{cars.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {cars.filter((c) => c.status === "available").length} available
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Contact
                </CardDescription>
                <CardTitle className="text-sm font-normal">
                  {company.email || "No email"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {company.phone || "No phone"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </CardDescription>
                <CardTitle className="text-sm font-normal">
                  {company.city || "—"}
                  {company.country ? `, ${company.country}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {company.address || "No address"}
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Logo section */}
      {!editing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Company Logo</CardTitle>
                <CardDescription>
                  Square logo used across the platform
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoCropperOpen(true)}
                >
                  <Camera className="mr-1 h-3.5 w-3.5" />
                  {company.logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
                {company.logoUrl && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {company.logoUrl && (
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border bg-muted">
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="h-16 w-16 overflow-hidden rounded-full border bg-muted">
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preview of the logo in square and circular formats.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Tabs: Staff & Cars */}
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Staff ({staff.length})
          </TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="mr-1.5 h-3.5 w-3.5" />
            Cars ({cars.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <Card>
            <CardContent className="pt-6">
              {staff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No staff members yet</p>
                  <p className="text-xs text-muted-foreground">
                    Staff will appear here once added during onboarding.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {s.firstName} {s.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.phone || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              s.role === "manager" ? "default" : "secondary"
                            }
                          >
                            {s.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={s.isActive ? "default" : "destructive"}
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.lastLoginAt
                            ? new Date(s.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cars">
          <Card>
            <CardContent className="pt-6">
              {cars.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Car className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">No cars added yet</p>
                  <p className="text-xs text-muted-foreground">
                    Cars will appear here once the company adds them.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>License Plate</TableHead>
                      <TableHead>Fuel / Trans.</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Daily Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          {c.make} {c.model}
                          {c.year ? ` (${c.year})` : ""}
                          {c.color ? ` • ${c.color}` : ""}
                        </TableCell>
                        <TableCell>
                          {c.licensePlate ? (
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                              {c.licensePlate}
                            </code>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {c.fuelType} / {c.transmission}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {c.mileage?.toLocaleString()} km
                        </TableCell>
                        <TableCell>
                          {c.dailyRate ? `${formatCurrency(c.dailyRate, company.currency)}/day` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusColor(c.status) as
                                | "default"
                                | "destructive"
                                | "secondary"
                                | "outline"
                            }
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Company metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Company ID</dt>
              <dd className="font-mono">{company.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(company.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Onboarding</dt>
              <dd>
                <Badge
                  variant={company.onboardingCompleted ? "default" : "outline"}
                >
                  {company.onboardingCompleted ? "Completed" : "Pending"}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Logo Cropper Dialog */}
      <LogoCropper
        open={logoCropperOpen}
        onOpenChange={setLogoCropperOpen}
        onSave={handleLogoSave}
      />
    </div>
  );
}
