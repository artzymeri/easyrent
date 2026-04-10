export interface CarImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface CarDamage {
  id: number;
  description: string;
  location: string;
  severity: string;
  repaired: boolean;
  createdAt: string;
}

export interface CarDetail {
  id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin: string;
  engine: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  seats: number;
  dailyRate: number;
  status: string;
  notes: string;
  registrationExpiry: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  nextServiceMileage: number;
  createdAt: string;
  qrCode: string | null;
  repairParts: string[] | null;
  images: CarImage[];
  damages: CarDamage[];
  documents?: { id: number; name: string; url: string; type: string; sortOrder: number }[];
}

export function statusConfig(status: string) {
  switch (status) {
    case "available":
      return { className: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10" };
    case "rented":
      return { className: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/10" };
    case "maintenance":
      return { className: "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10" };
    case "out_of_service":
      return { className: "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/10" };
    case "needs_repair":
      return { className: "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/10" };
    default:
      return { className: "" };
  }
}

export function resolveColor(color: string, t: (key: string) => string) {
  const translated = t(`carsPage.colors.${color.toLowerCase()}`);
  return translated.startsWith("carsPage.") ? color : translated;
}

/** Check if a date string is within 30 days of now */
export function isExpiringSoon(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return diffMs > 0 && diffMs < 30 * 24 * 60 * 60 * 1000;
}

/** Check if a date string is in the past */
export function isExpired(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now();
}
