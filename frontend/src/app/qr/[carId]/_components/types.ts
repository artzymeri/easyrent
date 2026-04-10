export interface Company {
  id: number;
  name: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  currency: string;
}

export interface CarInfo {
  id: number;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
}

export interface BookingCustomer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface BookingInfo {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  notes: string | null;
  customer: BookingCustomer | null;
}

export interface BookingDetail {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  discount: number;
  extraCharges: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  pickupLocation: string;
  returnLocation: string;
  notes: string | null;
  car: CarInfo;
  customer: BookingCustomer;
  company: Company;
}

export const STATUS_LABELS: Record<string, string> = {
  pending_start: "Pending Start",
  in_progress: "In Progress",
  pending_return: "Pending Return",
  completed: "Completed",
  cancelled: "Cancelled",
};
