import type { ImageItem } from "@/components/image-upload";

export interface CarColor {
  id: number;
  code: string;
  hex: string | null;
  nameEn: string;
  nameSq: string;
  sortOrder: number;
}

export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  colorId: number | null;
  carColor?: CarColor;
  licensePlate: string;
  status: string;
  dailyRate: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  seats: number;
  images?: { id: number; isPrimary: boolean }[];
}

export interface DocumentItem {
  /** DB id for existing documents */
  id?: number;
  /** Client-side id for new documents */
  tempId?: string;
  name: string;
  url: string;
  type: string;
}

export interface CarFormData {
  make: string;
  model: string;
  year: string;
  color: string; // Legacy
  colorId: string; // New - stores the color ID
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
  repairParts: string[];
}

// Legacy color keys - kept for backwards compatibility
export const COLOR_KEYS = [
  "black", "white", "silver", "gray", "red", "blue",
  "green", "yellow", "orange", "brown", "beige", "gold",
  "maroon", "navy", "purple", "pink",
] as const;

export const REPAIR_PARTS = [
  "door", "engine", "windshield", "tires", "brakes", "suspension",
  "exhaust", "lights", "mirrors", "bumper", "hood", "trunk",
  "interior", "electrical", "ac", "battery", "radiator", "clutch",
  "steering", "wipers",
] as const;

export const EMPTY_FORM: CarFormData = {
  make: "",
  model: "",
  year: "",
  color: "",
  colorId: "",
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
  repairParts: [],
};

export interface CarFormFieldsProps {
  form: CarFormData;
  setForm: React.Dispatch<React.SetStateAction<CarFormData>>;
  makes: string[];
  models: string[];
  carColors: CarColor[];
  loadModels: (make: string) => void;
  sheetMode: "create" | "edit";
  t: (key: string, params?: Record<string, string>) => string;
  locale: string;
}

export interface InsuranceProviderOption {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CarFormServiceProps {
  form: CarFormData;
  setForm: React.Dispatch<React.SetStateAction<CarFormData>>;
  images: ImageItem[];
  documents: DocumentItem[];
  sheetMode: "create" | "edit";
  insuranceProviders: InsuranceProviderOption[];
  onImageChange: (updated: ImageItem[]) => void;
  onDocumentFiles: (files: FileList | File[]) => void;
  onRemoveDocument: (index: number) => void;
  docInputRef: React.RefObject<HTMLInputElement | null>;
  t: (key: string, params?: Record<string, string>) => string;
}
