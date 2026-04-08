// ── Shared Types ─────────────────────────────────────────────

export interface CompanyData {
  name: string;
  subdomain: string;
  email: string;
  phoneCode: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  slogan: string;
  logoUrl: string;
  signature: string;
  stampUrl: string;
  businessNumber: string;
  businessFaxNumber: string;
  companyIdNumber: string;
}

export interface StaffData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "manager" | "regular";
  phoneCode: string;
  phone: string;
}

export interface CarData {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  vin: string;
  engine: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  seats: string;
  dailyRate: string;
  status: string;
  notes: string;
  registrationExpiry: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  nextServiceMileage: string;
}

export type SubdomainStatus = "idle" | "checking" | "available" | "taken" | "reserved" | "invalid";

export const STEPS = [
  { label: "Company", description: "Basic details" },
  { label: "Staff", description: "Team members" },
  { label: "Cars", description: "Optional" },
  { label: "Review", description: "Complete setup" },
] as const;
