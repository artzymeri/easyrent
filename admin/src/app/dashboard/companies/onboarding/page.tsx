"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import type { CompanyData, StaffData, CarData, SubdomainStatus } from "./types";
import { StepSidebar } from "./step-sidebar";
import { StepCompany } from "./step-company";
import { StepStaff } from "./step-staff";
import { StepCars } from "./step-cars";
import { StepReview } from "./step-review";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  // ── Step 1 state ────────────────────────────────────────────

  const [company, setCompany] = useState<CompanyData>({
    name: "",
    subdomain: "",
    email: "",
    phoneCode: "+383",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkSubdomain = useCallback(async (value: string) => {
    if (!value || value.length < 2) {
      setSubdomainStatus("idle");
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length > 1) {
      setSubdomainStatus("invalid");
      return;
    }
    setSubdomainStatus("checking");
    try {
      const res = await api.get<{ available: boolean; reason?: string }>(
        `/companies/check-subdomain/${encodeURIComponent(value)}`
      );
      if (res.available) {
        setSubdomainStatus("available");
      } else {
        setSubdomainStatus(res.reason === "reserved" ? "reserved" : "taken");
      }
    } catch {
      setSubdomainStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const value = company.subdomain;
    if (!value) {
      setSubdomainStatus("idle");
      return;
    }
    debounceRef.current = setTimeout(() => checkSubdomain(value), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [company.subdomain, checkSubdomain]);

  // ── Step 2 state ────────────────────────────────────────────

  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [currentStaff, setCurrentStaff] = useState<StaffData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "manager",
    phoneCode: "+383",
    phone: "",
  });

  // ── Step 3 state ────────────────────────────────────────────

  const [carsList, setCarsList] = useState<CarData[]>([]);
  const [currentCar, setCurrentCar] = useState<CarData>({
    make: "",
    model: "",
    year: "",
    color: "",
    licensePlate: "",
    vin: "",
    engine: "",
    fuelType: "gasoline",
    transmission: "automatic",
    mileage: "",
    seats: "5",
    dailyRate: "",
    status: "available",
    notes: "",
    registrationExpiry: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
    lastServiceDate: "",
    nextServiceDate: "",
    nextServiceMileage: "",
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  // ── Handlers ────────────────────────────────────────────────

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

  const handleCreateCompany = async () => {
    if (!company.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!company.subdomain.trim()) {
      toast.error("Subdomain is required");
      return;
    }
    if (subdomainStatus !== "available") {
      toast.error("Please choose an available subdomain");
      return;
    }
    if (!company.country) {
      toast.error("Country is required");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...company,
        phone: company.phone ? `${company.phoneCode} ${company.phone}` : "",
      };
      const created = await api.post<{ id: number }>("/companies", payload);
      setCompanyId(created.id);
      toast.success("Company created!");
      setStep(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!currentStaff.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!currentStaff.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!currentStaff.email.trim()) {
      toast.error("Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentStaff.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!currentStaff.password) {
      toast.error("Password is required");
      return;
    }
    if (currentStaff.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...currentStaff,
        phone: currentStaff.phone ? `${currentStaff.phoneCode} ${currentStaff.phone}` : "",
      };
      await api.post(`/companies/${companyId}/staff`, payload);
      setStaffList([...staffList, { ...currentStaff }]);
      setCurrentStaff({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "regular",
        phoneCode: currentStaff.phoneCode,
        phone: "",
      });
      toast.success("Staff member added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async () => {
    if (!currentCar.make) {
      toast.error("Car make is required");
      return;
    }
    if (!currentCar.model) {
      toast.error("Car model is required");
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
        nextServiceMileage: currentCar.nextServiceMileage ? parseInt(currentCar.nextServiceMileage) : null,
      });
      setCarsList([...carsList, { ...currentCar }]);
      setCurrentCar({
        make: "",
        model: "",
        year: "",
        color: "",
        licensePlate: "",
        vin: "",
        engine: "",
        fuelType: "gasoline",
        transmission: "automatic",
        mileage: "",
        seats: "5",
        dailyRate: "",
        status: "available",
        notes: "",
        registrationExpiry: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
        insuranceExpiry: "",
        lastServiceDate: "",
        nextServiceDate: "",
        nextServiceMileage: "",
      });
      setModels([]);
      toast.success("Car added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add car");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Company</h1>
            <p className="text-sm text-muted-foreground">
              Set up a rental company in just a few steps
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <StepSidebar currentStep={step} />

        <div className="min-w-0 flex-1 pb-24 md:pb-0">
          {step === 0 && (
            <StepCompany
              company={company}
              setCompany={setCompany}
              subdomainStatus={subdomainStatus}
              loading={loading}
              onSubmit={handleCreateCompany}
            />
          )}

          {step === 1 && (
            <StepStaff
              staffList={staffList}
              currentStaff={currentStaff}
              setCurrentStaff={setCurrentStaff}
              loading={loading}
              onAddStaff={handleAddStaff}
              onBack={() => setStep(0)}
              onNext={() => {
                if (staffList.length === 0) {
                  toast.error("At least one staff member is required");
                  return;
                }
                loadMakes();
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <StepCars
              carsList={carsList}
              currentCar={currentCar}
              setCurrentCar={setCurrentCar}
              makes={makes}
              models={models}
              loading={loading}
              onLoadModels={loadModels}
              onAddCar={handleAddCar}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepReview
              company={company}
              staffList={staffList}
              carsList={carsList}
              loading={loading}
              onBack={() => setStep(2)}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
