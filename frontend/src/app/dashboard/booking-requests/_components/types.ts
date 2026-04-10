export interface CarImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface BookingRequest {
  id: number;
  companyId: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: string;
  totalAmount: string;
  requesterFirstName: string;
  requesterLastName: string;
  requesterEmail: string | null;
  requesterPhone: string;
  status: "pending" | "confirmed" | "rejected";
  notes: string | null;
  createdAt: string;
  car: {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    color: string;
    dailyRate: string;
    images: CarImage[];
  };
}

export type StatusFilter = "all" | "pending" | "confirmed" | "rejected";

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};
