export interface BookingAlert {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  customer: { id: number; firstName: string; lastName: string; phone: string } | null;
  car: { id: number; make: string; model: string; licensePlate: string } | null;
}

export interface CarAlert {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  status: string;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  nextServiceDate: string | null;
  repairParts: string[] | null;
}

export interface DashboardData {
  bookingAlerts: {
    endingSoon: BookingAlert[];
    overdue: BookingAlert[];
  };
  carAlerts: {
    registrationExpiring: CarAlert[];
    registrationExpired: CarAlert[];
    insuranceExpiring: CarAlert[];
    insuranceExpired: CarAlert[];
    serviceDue: CarAlert[];
    needsRepair: CarAlert[];
  };
  fleetStats: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    outOfService: number;
    needsRepair: number;
  };
  bookingStats: {
    total: number;
    pendingStart: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    monthly: { year: number; month: number; revenue: number }[];
  };
  customerCount: number;
  recentBookings: BookingAlert[];
}

export const MONTH_KEYS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
