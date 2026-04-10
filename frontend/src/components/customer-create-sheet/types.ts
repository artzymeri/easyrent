// ── Types & Helpers for CustomerCreateSheet ────────────────────

export interface DocumentItem {
  id?: number;
  tempId?: string;
  url: string;
  documentType: "id_card" | "drivers_license" | "passport" | "other";
}

export interface CreatedCustomer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export interface CustomerPrefill {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface CustomerCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: CreatedCustomer) => void;
  prefill?: CustomerPrefill | null;
}

export interface CustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  personalNumber: string;
  driversLicense: string;
  driversLicenseExpiry: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  notes: string;
}

export const EMPTY_FORM: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  idNumber: "",
  personalNumber: "",
  driversLicense: "",
  driversLicenseExpiry: "",
  dateOfBirth: "",
  address: "",
  city: "",
  country: "",
  notes: "",
};

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function fuzzyMatch(value: string, options: string[]): string {
  if (!value) return "";
  const norm = normalize(value);
  const exact = options.find((o) => normalize(o) === norm);
  if (exact) return exact;
  const starts = options.find(
    (o) => normalize(o).startsWith(norm) || norm.startsWith(normalize(o))
  );
  if (starts) return starts;
  const contains = options.find(
    (o) => normalize(o).includes(norm) || norm.includes(normalize(o))
  );
  if (contains) return contains;
  return "";
}
