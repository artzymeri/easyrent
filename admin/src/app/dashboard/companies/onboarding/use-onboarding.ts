"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";

import type { CompanyData, StaffData, CarData, SubdomainStatus } from "./types";

const INITIAL_STAFF: StaffData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "manager",
  phoneCode: "+383",
  phone: "",
};

const INITIAL_CAR: CarData = {
  make: "", model: "", year: "", color: "", licensePlate: "", vin: "",
  engine: "", fuelType: "gasoline", transmission: "automatic", mileage: "",
  seats: "5", dailyRate: "", status: "available", notes: "",
  registrationExpiry: "", insuranceProvider: "", insurancePolicyNumber: "",
  insuranceExpiry: "", lastServiceDate: "", nextServiceDate: "", nextServiceMileage: "",
};

export function useOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);

  const [company, setCompany] = useState<CompanyData>({
    name: "", subdomain: "", email: "", phoneCode: "+383", phone: "",
    address: "", city: "", country: "", slogan: "", logoUrl: "",
    signature: "", stampUrl: "", businessNumber: "", businessFaxNumber: "",
    companyIdNumber: "",
  });

  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkSubdomain = useCallback(async (value: string) => {
    if (!value || value.length < 2) { setSubdomainStatus("idle"); return; }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value) && value.length > 1) {
      setSubdomainStatus("invalid"); return;
    }
    setSubdomainStatus("checking");
    try {
      const res = await api.get<{ available: boolean; reason?: string }>(
        `/companies/check-subdomain/${encodeURIComponent(value)}`
      );
      setSubdomainStatus(res.available ? "available" : res.reason === "reserved" ? "reserved" : "taken");
    } catch { setSubdomainStatus("idle"); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const value = company.subdomain;
    if (!value) { setSubdomainStatus("idle"); return; }
    debounceRef.current = setTimeout(() => checkSubdomain(value), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [company.subdomain, checkSubdomain]);

  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [currentStaff, setCurrentStaff] = useState<StaffData>(INITIAL_STAFF);
  const [carsList, setCarsList] = useState<CarData[]>([]);
  const [currentCar, setCurrentCar] = useState<CarData>(INITIAL_CAR);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const loadMakes = async () => {
    if (makes.length > 0) return;
    try { setMakes(await api.get<string[]>("/data/car-makes")); }
    catch { toast.error("Failed to load car makes"); }
  };

  const loadModels = async (make: string) => {
    try { setModels(await api.get<string[]>(`/data/car-models/${encodeURIComponent(make)}`)); }
    catch { setModels([]); }
  };

  const handleCreateCompany = async () => {
    if (!company.name.trim()) { toast.error("Company name is required"); return; }
    if (!company.subdomain.trim()) { toast.error("Subdomain is required"); return; }
    if (subdomainStatus !== "available") { toast.error("Please choose an available subdomain"); return; }
    if (!company.country) { toast.error("Country is required"); return; }
    setLoading(true);
    try {
      const payload = { ...company, phone: company.phone ? `${company.phoneCode} ${company.phone}` : "" };
      const created = await api.post<{ id: number }>("/companies", payload);
      setCompanyId(created.id);
      toast.success("Company created!");
      setStep(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create company");
    } finally { setLoading(false); }
  };

  const handleAddStaff = async () => {
    if (!currentStaff.firstName.trim()) { toast.error("First name is required"); return; }
    if (!currentStaff.lastName.trim()) { toast.error("Last name is required"); return; }
    if (!currentStaff.email.trim()) { toast.error("Email address is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentStaff.email)) { toast.error("Please enter a valid email address"); return; }
    if (!currentStaff.password) { toast.error("Password is required"); return; }
    if (currentStaff.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const payload = { ...currentStaff, phone: currentStaff.phone ? `${currentStaff.phoneCode} ${currentStaff.phone}` : "" };
      await api.post(`/companies/${companyId}/staff`, payload);
      setStaffList([...staffList, { ...currentStaff }]);
      setCurrentStaff({ ...INITIAL_STAFF, role: "regular", phoneCode: currentStaff.phoneCode });
      toast.success("Staff member added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff");
    } finally { setLoading(false); }
  };

  const handleAddCar = async () => {
    if (!currentCar.make) { toast.error("Car make is required"); return; }
    if (!currentCar.model) { toast.error("Car model is required"); return; }
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
      setCurrentCar(INITIAL_CAR);
      setModels([]);
      toast.success("Car added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add car");
    } finally { setLoading(false); }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post(`/companies/${companyId}/complete-onboarding`, {});
      toast.success("Onboarding completed! Company is ready.");
      router.push("/dashboard/companies");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally { setLoading(false); }
  };

  return {
    step, setStep, loading, company, setCompany, subdomainStatus,
    staffList, currentStaff, setCurrentStaff, carsList, currentCar, setCurrentCar,
    makes, models, loadMakes, loadModels,
    handleCreateCompany, handleAddStaff, handleAddCar, handleComplete,
  };
}
