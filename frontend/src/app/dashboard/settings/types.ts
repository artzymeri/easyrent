export interface CompanySettings {
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
}

export interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "manager" | "regular";
}

export interface CompanyForm {
  email: string;
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

export interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
