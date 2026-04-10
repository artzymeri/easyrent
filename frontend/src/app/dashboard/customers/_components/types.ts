export interface DocumentItem {
  id?: number;
  tempId?: string;
  url: string;
  documentType: "id_card" | "drivers_license" | "passport" | "other";
}

export interface Customer {
  id: number;
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
  createdAt: string;
  documents?: DocumentItem[];
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

/** Normalize a string for fuzzy matching (strip diacritics, lowercase) */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Find the best matching option from a list given an AI-extracted value */
export function fuzzyMatch(value: string, options: string[]): string {
  if (!value) return "";
  const norm = normalize(value);
  // Exact match first
  const exact = options.find((o) => normalize(o) === norm);
  if (exact) return exact;
  // Starts-with match
  const starts = options.find(
    (o) => normalize(o).startsWith(norm) || norm.startsWith(normalize(o))
  );
  if (starts) return starts;
  // Contains match
  const contains = options.find(
    (o) => normalize(o).includes(norm) || norm.includes(normalize(o))
  );
  if (contains) return contains;
  return "";
}
