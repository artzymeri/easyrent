"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

interface Company {
  id: number;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoUrl: string | null;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  staffCount?: number;
  carCount?: number;
  Staff?: StaffMember[];
  Cars?: CarItem[];
}

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
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get<Company>(`/companies/${id}`);
        setCompany(data);
        setStaff(data.Staff || []);
        setCars(data.Cars || []);
      } catch {
        toast.error("Failed to load company");
        router.push("/dashboard/companies");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const toggleCompanyStatus = async () => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { isActive: !company.isActive });
      setCompany({ ...company, isActive: !company.isActive });
      toast.success(company.isActive ? "Company deactivated" : "Company activated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading company…</div>
      </div>
    );
  }

  if (!company) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case "available": return "default";
      case "rented": return "destructive";
      case "maintenance": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
            <Badge variant={company.isActive ? "default" : "destructive"}>
              {company.isActive ? "Active" : "Inactive"}
            </Badge>
            {!company.onboardingCompleted && (
              <Badge variant="secondary">Onboarding Incomplete</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            <code className="text-sm">{company.subdomain}</code>.easyrent.com
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/companies")}>
            ← Back
          </Button>
          <Button
            variant={company.isActive ? "destructive" : "default"}
            onClick={toggleCompanyStatus}
          >
            {company.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Staff</CardDescription>
            <CardTitle className="text-2xl">{staff.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cars</CardDescription>
            <CardTitle className="text-2xl">{cars.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contact</CardDescription>
            <CardTitle className="text-sm font-normal">
              {company.email || "No email"}
              <br />
              {company.phone || "No phone"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Location</CardDescription>
            <CardTitle className="text-sm font-normal">
              {company.city || "—"}{company.country ? `, ${company.country}` : ""}
              {company.address && <><br />{company.address}</>}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
          <TabsTrigger value="cars">Cars ({cars.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <Card>
            <CardContent className="pt-6">
              {staff.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No staff members yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
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
                            {s.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.lastLoginAt
                            ? new Date(s.lastLoginAt).toLocaleDateString()
                            : "Never"}
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
                <p className="py-8 text-center text-muted-foreground">
                  No cars added yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Fuel / Trans.</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Rate</TableHead>
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
                        <TableCell>{c.licensePlate || "—"}</TableCell>
                        <TableCell className="capitalize">
                          {c.fuelType} / {c.transmission}
                        </TableCell>
                        <TableCell>{c.mileage?.toLocaleString()} km</TableCell>
                        <TableCell>
                          {c.dailyRate ? `$${c.dailyRate}/day` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(c.status) as "default" | "destructive" | "secondary" | "outline"}>
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
    </div>
  );
}
