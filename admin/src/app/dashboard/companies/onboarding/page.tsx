"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────

interface CompanyData {
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface StaffData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "manager" | "regular";
  phone: string;
}

interface CarData {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  engine: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  seats: string;
  dailyRate: string;
  registrationExpiry: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
}

const STEPS = ["Company Details", "Add Staff", "Add Cars (Optional)", "Review & Complete"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // Step 1 state
  const [company, setCompany] = useState<CompanyData>({
    name: "",
    subdomain: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  // Step 2 state
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [currentStaff, setCurrentStaff] = useState<StaffData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "manager",
    phone: "",
  });

  // Step 3 state
  const [carsList, setCarsList] = useState<CarData[]>([]);
  const [currentCar, setCurrentCar] = useState<CarData>({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    engine: "",
    fuelType: "gasoline",
    transmission: "automatic",
    mileage: "",
    seats: "5",
    dailyRate: "",
    registrationExpiry: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  // Load car makes on step 3
  const loadMakes = async () => {
    if (makes.length > 0) return;
    try {
      const data = await api.get<string[]>("/data/car-makes");
      setMakes(data);
    } catch {
      toast.error("Failed to load car makes");
    }
  };

  const loadModels = async (make: string) => {
    try {
      const data = await api.get<string[]>(`/data/car-models/${encodeURIComponent(make)}`);
      setModels(data);
    } catch {
      setModels([]);
    }
  };

  // ── Step 1: Create Company ──────────────────────────────────

  const handleCreateCompany = async () => {
    if (!company.name || !company.subdomain) {
      toast.error("Company name and subdomain are required");
      return;
    }

    setLoading(true);
    try {
      const created = await api.post<{ id: number }>("/companies", company);
      setCompanyId(created.id);
      toast.success("Company created!");
      setStep(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Add Staff ───────────────────────────────────────

  const handleAddStaff = async () => {
    if (!currentStaff.firstName || !currentStaff.lastName || !currentStaff.email || !currentStaff.password) {
      toast.error("First name, last name, email, and password are required");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/companies/${companyId}/staff`, currentStaff);
      setStaffList([...staffList, { ...currentStaff }]);
      setCurrentStaff({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "regular",
        phone: "",
      });
      toast.success("Staff member added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Add Car ─────────────────────────────────────────

  const handleAddCar = async () => {
    if (!currentCar.make || !currentCar.model) {
      toast.error("Make and model are required");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/cars/company/${companyId}`, {
        ...currentCar,
        year: currentCar.year ? parseInt(currentCar.year) : null,
        mileage: currentCar.mileage ? parseInt(currentCar.mileage) : 0,
        seats: currentCar.seats ? parseInt(currentCar.seats) : 5,
        dailyRate: currentCar.dailyRate ? parseFloat(currentCar.dailyRate) : null,
      });
      setCarsList([...carsList, { ...currentCar }]);
      setCurrentCar({
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        engine: "",
        fuelType: "gasoline",
        transmission: "automatic",
        mileage: "",
        seats: "5",
        dailyRate: "",
        registrationExpiry: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
        insuranceExpiry: "",
      });
      setModels([]);
      toast.success("Car added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add car");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4: Complete Onboarding ─────────────────────────────

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post(`/companies/${companyId}/complete-onboarding`, {});
      toast.success("Onboarding completed! Company is ready.");
      router.push("/dashboard/companies");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Company Onboarding</h1>
        <p className="text-muted-foreground">Set up a new rental company on the platform</p>
      </div>

      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                i === step ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px w-6 bg-border sm:w-12" />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Company Details ─────────────────────────── */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Basic information about the rental company</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="Kosova Rent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain *</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="subdomain"
                    value={company.subdomain}
                    onChange={(e) =>
                      setCompany({
                        ...company,
                        subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                    placeholder="kosova-rent"
                  />
                  <span className="whitespace-nowrap text-sm text-muted-foreground">.easyrent.com</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                  placeholder="info@kosovarent.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  placeholder="+383 44 000 000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                placeholder="123 Main Street"
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                  placeholder="Pristina"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={company.country}
                  onChange={(e) => setCompany({ ...company, country: e.target.value })}
                  placeholder="Kosovo"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleCreateCompany} disabled={loading}>
                {loading ? "Creating…" : "Next: Add Staff →"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Add Staff ───────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Staff Members</CardTitle>
            <CardDescription>
              At least one staff member is required. They will use these credentials to log in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* List of added staff */}
            {staffList.length > 0 && (
              <div className="space-y-2">
                <Label>Added Staff ({staffList.length})</Label>
                <div className="space-y-2">
                  {staffList.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <span className="font-medium">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">{s.email}</span>
                      </div>
                      <Badge variant={s.role === "manager" ? "default" : "secondary"}>
                        {s.role}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            )}

            {/* Add staff form */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={currentStaff.firstName}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={currentStaff.lastName}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={currentStaff.email}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                  placeholder="john@kosovarent.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={currentStaff.password}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, password: e.target.value })}
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={currentStaff.role}
                  onValueChange={(val) => setCurrentStaff({ ...currentStaff, role: val as "manager" | "regular" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={currentStaff.phone}
                  onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                  placeholder="+383 44 000 000"
                />
              </div>
            </div>

            <Button onClick={handleAddStaff} disabled={loading} variant="secondary">
              {loading ? "Adding…" : "+ Add Staff Member"}
            </Button>

            <Separator />

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                ← Back
              </Button>
              <Button
                onClick={() => {
                  if (staffList.length === 0) {
                    toast.error("At least one staff member is required");
                    return;
                  }
                  loadMakes();
                  setStep(2);
                }}
              >
                Next: Add Cars →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Add Cars (Optional) ─────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Cars (Optional)</CardTitle>
            <CardDescription>
              You can add cars now or do it later from the company dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* List of added cars */}
            {carsList.length > 0 && (
              <div className="space-y-2">
                <Label>Added Cars ({carsList.length})</Label>
                <div className="space-y-2">
                  {carsList.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <span className="font-medium">
                          {c.make} {c.model}
                        </span>
                        {c.year && <span className="ml-1 text-sm text-muted-foreground">({c.year})</span>}
                        {c.licensePlate && (
                          <span className="ml-2 text-sm text-muted-foreground">• {c.licensePlate}</span>
                        )}
                      </div>
                      {c.dailyRate && (
                        <Badge variant="outline">{formatCurrency(c.dailyRate)}/day</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
              </div>
            )}

            {/* Add car form */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Make *</Label>
                <Select
                  value={currentCar.make}
                  onValueChange={(val) => {
                    setCurrentCar({ ...currentCar, make: val ?? "", model: "" });
                    if (val) loadModels(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select
                  value={currentCar.model}
                  onValueChange={(val) => setCurrentCar({ ...currentCar, model: val ?? "" })}
                  disabled={!currentCar.make}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={currentCar.make ? "Select model" : "Select make first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={currentCar.year}
                  onChange={(e) => setCurrentCar({ ...currentCar, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  value={currentCar.color}
                  onChange={(e) => setCurrentCar({ ...currentCar, color: e.target.value })}
                  placeholder="Black"
                />
              </div>
              <div className="space-y-2">
                <Label>License Plate</Label>
                <Input
                  value={currentCar.licensePlate}
                  onChange={(e) => setCurrentCar({ ...currentCar, licensePlate: e.target.value })}
                  placeholder="01-234-AB"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Engine</Label>
                <Input
                  value={currentCar.engine}
                  onChange={(e) => setCurrentCar({ ...currentCar, engine: e.target.value })}
                  placeholder="2.0L Turbo"
                />
              </div>
              <div className="space-y-2">
                <Label>Fuel Type</Label>
                <Select
                  value={currentCar.fuelType}
                  onValueChange={(val) => setCurrentCar({ ...currentCar, fuelType: val ?? "gasoline" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="plugin_hybrid">Plugin Hybrid</SelectItem>
                    <SelectItem value="lpg">LPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Transmission</Label>
                <Select
                  value={currentCar.transmission}
                  onValueChange={(val) => setCurrentCar({ ...currentCar, transmission: val ?? "automatic" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Mileage (km)</Label>
                <Input
                  type="number"
                  value={currentCar.mileage}
                  onChange={(e) => setCurrentCar({ ...currentCar, mileage: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Seats</Label>
                <Input
                  type="number"
                  value={currentCar.seats}
                  onChange={(e) => setCurrentCar({ ...currentCar, seats: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={currentCar.dailyRate}
                  onChange={(e) => setCurrentCar({ ...currentCar, dailyRate: e.target.value })}
                  placeholder="50.00"
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Registration Expiry</Label>
                <DatePicker
                  value={currentCar.registrationExpiry}
                  onChange={(val) => setCurrentCar({ ...currentCar, registrationExpiry: val })}
                />
              </div>
              <div className="space-y-2">
                <Label>Insurance Provider</Label>
                <Input
                  value={currentCar.insuranceProvider}
                  onChange={(e) => setCurrentCar({ ...currentCar, insuranceProvider: e.target.value })}
                  placeholder="ABC Insurance"
                />
              </div>
              <div className="space-y-2">
                <Label>Insurance Expiry</Label>
                <DatePicker
                  value={currentCar.insuranceExpiry}
                  onChange={(val) => setCurrentCar({ ...currentCar, insuranceExpiry: val })}
                />
              </div>
            </div>

            <Button onClick={handleAddCar} disabled={loading} variant="secondary">
              {loading ? "Adding…" : "+ Add Car"}
            </Button>

            <Separator />

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(3)}>Next: Review →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Review & Complete ───────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Complete</CardTitle>
            <CardDescription>Review the onboarding details and complete setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company summary */}
            <div>
              <h3 className="mb-2 font-semibold">Company</h3>
              <div className="rounded-lg border p-4">
                <div className="text-lg font-medium">{company.name}</div>
                <div className="text-sm text-muted-foreground">
                  Subdomain:{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5">{company.subdomain}</code>
                  .easyrent.com
                </div>
                {company.city && (
                  <div className="text-sm text-muted-foreground">
                    {company.city}
                    {company.country ? `, ${company.country}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Staff summary */}
            <div>
              <h3 className="mb-2 font-semibold">Staff ({staffList.length})</h3>
              <div className="space-y-2">
                {staffList.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <span className="font-medium">
                        {s.firstName} {s.lastName}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">{s.email}</span>
                    </div>
                    <Badge variant={s.role === "manager" ? "default" : "secondary"}>
                      {s.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Cars summary */}
            <div>
              <h3 className="mb-2 font-semibold">Cars ({carsList.length})</h3>
              {carsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cars added — can be added later.</p>
              ) : (
                <div className="space-y-2">
                  {carsList.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium">
                        {c.make} {c.model} {c.year && `(${c.year})`}
                      </span>
                      {c.dailyRate && <Badge variant="outline">{formatCurrency(c.dailyRate)}/day</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button onClick={handleComplete} disabled={loading} size="lg">
                {loading ? "Completing…" : "✓ Complete Onboarding"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
