export interface Company {
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
  slogan: string | null;
  signature: string | null;
  stampUrl: string | null;
  businessNumber: string | null;
  businessFaxNumber: string | null;
  companyIdNumber: string | null;
  websiteTemplate: string;
  websitePublished: boolean;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  staff?: StaffMember[];
  cars?: CarItem[];
}

export interface StaffMember {
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

export interface CarItem {
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

export interface EditFormState {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
  slogan: string;
  signature: string;
  stampUrl: string;
  businessNumber: string;
  businessFaxNumber: string;
  companyIdNumber: string;
}
