import type { ImageItem } from "@/components/image-upload";

export interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  discount: number;
  extraCharges: number;
  amountPaid: number;
  paymentStatus: string;
  pickupLocation: string;
  returnLocation: string;
  mileageOut: number | null;
  mileageIn: number | null;
  notes: string | null;
  actualReturnDate: string | null;
  secondaryDriverName?: string | null;
  secondaryDriverPhone?: string | null;
  secondaryDriverIdNumber?: string | null;
  secondaryDriverLicense?: string | null;
  bookingImages?: { id: number; url: string; type: string; caption?: string }[];
  customer: { id: number; firstName: string; lastName: string; phone: string; email?: string };
  car: { id: number; make: string; model: string; licensePlate: string; color: string };
  createdBy?: { id: number; firstName: string; lastName: string };
  createdAt: string;
}

export interface Car {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  dailyRate: number;
  status: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface DeliveryPoint {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
}

export interface BookingForm {
  carId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  dailyRate: string;
  pickupLocation: string;
  returnLocation: string;
  discount: string;
  mileageOut: string;
  notes: string;
  secondaryDriverName: string;
  secondaryDriverPhone: string;
  secondaryDriverIdNumber: string;
  secondaryDriverLicense: string;
}

export interface PendingRequestInfo {
  requesterFirstName: string;
  requesterLastName: string;
  requesterEmail: string | null;
  requesterPhone: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: string;
  dailyRate: string;
  carName: string;
}

// Calendar helpers
export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export const MONTH_KEYS = [
  "bookingsPage.months.january", "bookingsPage.months.february", "bookingsPage.months.march",
  "bookingsPage.months.april", "bookingsPage.months.may", "bookingsPage.months.june",
  "bookingsPage.months.july", "bookingsPage.months.august", "bookingsPage.months.september",
  "bookingsPage.months.october", "bookingsPage.months.november", "bookingsPage.months.december",
];

export const DAY_KEYS = [
  "bookingsPage.calendarDays.sun", "bookingsPage.calendarDays.mon", "bookingsPage.calendarDays.tue",
  "bookingsPage.calendarDays.wed", "bookingsPage.calendarDays.thu", "bookingsPage.calendarDays.fri",
  "bookingsPage.calendarDays.sat",
];

export const STATUS_COLORS: Record<string, string> = {
  pending_start: "bg-yellow-200 text-yellow-900",
  in_progress: "bg-blue-200 text-blue-900",
  completed: "bg-green-200 text-green-900",
  cancelled: "bg-gray-200 text-gray-600",
  overdue: "bg-red-200 text-red-900",
  pending_return: "bg-orange-200 text-orange-900",
};

export const BOOKING_COLORS = [
  { bg: "bg-blue-500", text: "text-white", dot: "bg-blue-500" },
  { bg: "bg-emerald-500", text: "text-white", dot: "bg-emerald-500" },
  { bg: "bg-purple-500", text: "text-white", dot: "bg-purple-500" },
  { bg: "bg-amber-500", text: "text-white", dot: "bg-amber-500" },
  { bg: "bg-rose-500", text: "text-white", dot: "bg-rose-500" },
  { bg: "bg-cyan-500", text: "text-white", dot: "bg-cyan-500" },
  { bg: "bg-indigo-500", text: "text-white", dot: "bg-indigo-500" },
  { bg: "bg-orange-500", text: "text-white", dot: "bg-orange-500" },
];

export const EMPTY_FORM: BookingForm = {
  carId: "",
  customerId: "",
  startDate: "",
  endDate: "",
  dailyRate: "",
  pickupLocation: "",
  returnLocation: "",
  discount: "",
  mileageOut: "",
  notes: "",
  secondaryDriverName: "",
  secondaryDriverPhone: "",
  secondaryDriverIdNumber: "",
  secondaryDriverLicense: "",
};
