"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { CalendarDays, List, Play, CheckCircle2, XCircle, Car as CarIcon, User, MapPin, Clock, CreditCard, FileText, Hash, Download, ChevronLeft, ChevronRight, Camera, Image as ImageIcon, Mail, Plus, X, RotateCcw, Info, Phone } from "lucide-react";
import { DateTimePicker } from "@/components/date-time-picker";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { generateRentalReport, type ReportBooking, type ReportCompany } from "@/lib/generate-rental-report";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload, type ImageItem } from "@/components/image-upload";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataTable, Eye, Trash2, type DataTableAction } from "@/components/data-table";

interface Booking {
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

interface Car {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  dailyRate: number;
  status: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

interface DeliveryPoint {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
}

// Calendar helper
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_KEYS = [
  "bookingsPage.months.january", "bookingsPage.months.february", "bookingsPage.months.march",
  "bookingsPage.months.april", "bookingsPage.months.may", "bookingsPage.months.june",
  "bookingsPage.months.july", "bookingsPage.months.august", "bookingsPage.months.september",
  "bookingsPage.months.october", "bookingsPage.months.november", "bookingsPage.months.december",
];

const DAY_KEYS = [
  "bookingsPage.calendarDays.sun", "bookingsPage.calendarDays.mon", "bookingsPage.calendarDays.tue",
  "bookingsPage.calendarDays.wed", "bookingsPage.calendarDays.thu", "bookingsPage.calendarDays.fri",
  "bookingsPage.calendarDays.sat",
];

const STATUS_COLORS: Record<string, string> = {
  pending_start: "bg-yellow-200 text-yellow-900",
  in_progress: "bg-blue-200 text-blue-900",
  completed: "bg-green-200 text-green-900",
  cancelled: "bg-gray-200 text-gray-600",
  overdue: "bg-red-200 text-red-900",
  pending_return: "bg-orange-200 text-orange-900",
};

const BOOKING_COLORS = [
  { bg: "bg-blue-500", text: "text-white", dot: "bg-blue-500" },
  { bg: "bg-emerald-500", text: "text-white", dot: "bg-emerald-500" },
  { bg: "bg-purple-500", text: "text-white", dot: "bg-purple-500" },
  { bg: "bg-amber-500", text: "text-white", dot: "bg-amber-500" },
  { bg: "bg-rose-500", text: "text-white", dot: "bg-rose-500" },
  { bg: "bg-cyan-500", text: "text-white", dot: "bg-cyan-500" },
  { bg: "bg-indigo-500", text: "text-white", dot: "bg-indigo-500" },
  { bg: "bg-orange-500", text: "text-white", dot: "bg-orange-500" },
];

function BookingsPageContent() {
  const { t } = useTranslation();
  const { fc, currency } = useCurrency();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const [form, setForm] = useState({
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
  });

  // Start booking dialog state
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [startingBooking, setStartingBooking] = useState<Booking | null>(null);
  const [preStartImages, setPreStartImages] = useState<ImageItem[]>([]);
  const [startingSaving, setStartingSaving] = useState(false);
  const [pickupCustom, setPickupCustom] = useState(false);
  const [returnCustom, setReturnCustom] = useState(false);

  // Quick customer creation
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [quickCustomerSaving, setQuickCustomerSaving] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", idNumber: "", personalNumber: "",
  });

  // Complete booking dialog state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
  const [completingBookingFull, setCompletingBookingFull] = useState<Booking | null>(null);
  const [settlementStep, setSettlementStep] = useState<"review" | "payment">("review");
  const [settleMileageIn, setSettleMileageIn] = useState("");
  const [settleExtraCharges, setSettleExtraCharges] = useState("");
  const [settlePaymentAmount, setSettlePaymentAmount] = useState("");
  const [completeSaving, setCompleteSaving] = useState(false);

  // Filter state
  const [filterCustomerId, setFilterCustomerId] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // Booking request pre-fill state
  const [pendingRequestId, setPendingRequestId] = useState<number | null>(null);
  const [pendingRequestInfo, setPendingRequestInfo] = useState<{
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
  } | null>(null);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);

  const hasActiveFilters = filterCustomerId !== "" || filterFrom !== "" || filterTo !== "";

  const fetchBookings = async (custId?: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    params.set("limit", "500");
    if (custId) params.set("customerId", custId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const data = await api.get<{ rows: Booking[] }>(`/bookings?${params.toString()}`);
    return data.rows || [];
  };

  const fetchAll = async () => {
    try {
      const [bookingData, carData, custData, dpData] = await Promise.all([
        fetchBookings(filterCustomerId, filterFrom, filterTo),
        api.get<{ rows: Car[] }>("/cars"),
        api.get<{ rows: Customer[] }>("/customers"),
        api.get<DeliveryPoint[]>("/delivery-points"),
      ]);
      setBookings(bookingData);
      setCars(carData.rows || []);
      setCustomers(custData.rows || []);
      setDeliveryPoints(dpData.filter((dp) => dp.isActive));
    } catch {
      toast.error(t("bookingsPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle pre-fill from booking request
  useEffect(() => {
    const fromRequest = searchParams.get("fromRequest");
    if (!fromRequest || loading) return;

    const requestId = parseInt(fromRequest);
    if (isNaN(requestId)) return;

    // Only process once
    if (pendingRequestId === requestId) return;
    setPendingRequestId(requestId);

    (async () => {
      try {
        // Fetch the booking request details
        const req = await api.get<{
          id: number;
          carId: number;
          startDate: string;
          endDate: string;
          dailyRate: string;
          totalDays: number;
          totalAmount: string;
          requesterFirstName: string;
          requesterLastName: string;
          requesterEmail: string | null;
          requesterPhone: string;
          car: { id: number; make: string; model: string; licensePlate: string; dailyRate: string };
        }>(`/booking-requests/${requestId}`);

        // Normalize dates from API format "2026-04-25T10:00:00.000Z" to DateTimePicker format "2026-04-25T10:00"
        const normalizeDate = (dateStr: string) => {
          const d = new Date(dateStr);
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(d.getUTCDate()).padStart(2, "0");
          const hh = String(d.getUTCHours()).padStart(2, "0");
          const min = String(d.getUTCMinutes()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        };

        // Store request info for the info modal
        setPendingRequestInfo({
          requesterFirstName: req.requesterFirstName,
          requesterLastName: req.requesterLastName,
          requesterEmail: req.requesterEmail,
          requesterPhone: req.requesterPhone,
          startDate: normalizeDate(req.startDate),
          endDate: normalizeDate(req.endDate),
          totalDays: req.totalDays,
          totalAmount: req.totalAmount,
          dailyRate: req.dailyRate,
          carName: `${req.car.make} ${req.car.model} (${req.car.licensePlate})`,
        });

        // Pre-fill the form — don't pre-select customer, let staff pick/create
        setForm({
          carId: String(req.carId),
          customerId: "",
          startDate: normalizeDate(req.startDate),
          endDate: normalizeDate(req.endDate),
          dailyRate: String(req.dailyRate),
          pickupLocation: "",
          returnLocation: "",
          discount: "",
          mileageOut: "",
          notes: "",
          secondaryDriverName: "",
          secondaryDriverPhone: "",
          secondaryDriverIdNumber: "",
          secondaryDriverLicense: "",
        });

        // Store the request ID so handleCreate can pass it to the backend
        setPendingRequestId(requestId);

        // Open the new booking sheet
        setDialogOpen(true);

        // Clean up the URL
        router.replace("/dashboard/bookings", { scroll: false });
      } catch (err) {
        console.error("Failed to load booking request:", err);
        toast.error(t("bookingsPage.toast.failedLoad"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading]);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings(filterCustomerId, filterFrom, filterTo);
      setBookings(data);
    } catch {
      toast.error(t("bookingsPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilterCustomerId("");
    setFilterFrom("");
    setFilterTo("");
    setLoading(true);
    try {
      const data = await fetchBookings("", "", "");
      setBookings(data);
    } catch {
      toast.error(t("bookingsPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch bookings when filters change
  useEffect(() => {
    if (!loading) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCustomerId, filterFrom, filterTo]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carId || !form.customerId || !form.startDate || !form.endDate) {
      toast.error(t("bookingsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      await api.post("/bookings", {
        carId: parseInt(form.carId),
        customerId: parseInt(form.customerId),
        startDate: form.startDate,
        endDate: form.endDate,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
        pickupLocation: form.pickupLocation,
        returnLocation: form.returnLocation,
        discount: form.discount ? parseFloat(form.discount) : undefined,
        mileageOut: form.mileageOut ? parseInt(form.mileageOut) : undefined,
        notes: form.notes || undefined,
        secondaryDriverName: form.secondaryDriverName || undefined,
        secondaryDriverPhone: form.secondaryDriverPhone || undefined,
        secondaryDriverIdNumber: form.secondaryDriverIdNumber || undefined,
        secondaryDriverLicense: form.secondaryDriverLicense || undefined,
        bookingRequestId: pendingRequestId || undefined,
      });
      toast.success(t("bookingsPage.toast.created"));
      setForm({ carId: "", customerId: "", startDate: "", endDate: "", dailyRate: "", pickupLocation: "", returnLocation: "", discount: "", mileageOut: "", notes: "", secondaryDriverName: "", secondaryDriverPhone: "", secondaryDriverIdNumber: "", secondaryDriverLicense: "" });
      setPendingRequestId(null);
      setPendingRequestInfo(null);
      setPickupCustom(false);
      setReturnCustom(false);
      setDialogOpen(false);
      fetchAll();
    } catch {
      toast.error(t("bookingsPage.toast.failedCreate"));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickCustomerCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustomerForm.firstName || !quickCustomerForm.lastName) {
      toast.error(t("customersPage.validation.required"));
      return;
    }
    setQuickCustomerSaving(true);
    try {
      const created = await api.post<Customer & { id: number }>("/customers", quickCustomerForm);
      // Add to local customers list and auto-select
      setCustomers((prev) => [...prev, created]);
      setForm((prev) => ({ ...prev, customerId: String(created.id) }));
      setQuickCustomerOpen(false);
      setQuickCustomerForm({ firstName: "", lastName: "", email: "", phone: "", idNumber: "", personalNumber: "" });
      toast.success(t("customersPage.toast.added"));
    } catch {
      toast.error(t("customersPage.toast.failedAdd"));
    } finally {
      setQuickCustomerSaving(false);
    }
  };

  const updateStatus = async (bookingId: number, status: string, extra?: Record<string, unknown>) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status, ...extra });
      toast.success(t("bookingsPage.toast.statusUpdated"));
      fetchAll();
    } catch {
      toast.error(t("bookingsPage.toast.failedUpdate"));
    }
  };

  const handleStartBooking = (booking: Booking) => {
    setStartingBooking(booking);
    setPreStartImages([]);
    setStartDialogOpen(true);
  };

  const handleConfirmStart = async () => {
    if (!startingBooking) return;
    setStartingSaving(true);
    try {
      const imageUrls = preStartImages.map((img) => img.url);
      await api.put(`/bookings/${startingBooking.id}/status`, {
        status: "in_progress",
        preStartImages: imageUrls,
      });
      toast.success(t("bookingsPage.toast.statusUpdated"));
      setStartDialogOpen(false);
      setStartingBooking(null);
      setPreStartImages([]);
      setSheetOpen(false);
      fetchAll();
    } catch {
      toast.error(t("bookingsPage.toast.failedUpdate"));
    } finally {
      setStartingSaving(false);
    }
  };

  const handleCompleteBooking = async (booking: Booking) => {
    setCompletingBooking(booking);
    setCompleteDialogOpen(true);
    setSettlementStep("review");
    setSettleMileageIn("");
    setSettleExtraCharges("");
    setSettlePaymentAmount("");
    // Fetch full booking with images
    try {
      const fullBooking = await api.get<Booking>(`/bookings/${booking.id}`);
      setCompletingBookingFull(fullBooking);
    } catch {
      setCompletingBookingFull(null);
    }
  };

  const handleConfirmComplete = async () => {
    if (!completingBooking) return;
    setCompleteSaving(true);
    try {
      const body: Record<string, unknown> = { status: "completed" };
      if (settleMileageIn) body.mileageIn = parseInt(settleMileageIn);
      if (settleExtraCharges) body.extraCharges = parseFloat(settleExtraCharges);
      if (settlePaymentAmount) body.amountPaid = parseFloat(settlePaymentAmount);
      await api.put(`/bookings/${completingBooking.id}/status`, body);
      toast.success(t("bookingsPage.toast.statusUpdated"));
      setCompleteDialogOpen(false);
      setCompletingBooking(null);
      setCompletingBookingFull(null);
      setSheetOpen(false);
      fetchAll();
    } catch {
      toast.error(t("bookingsPage.toast.failedUpdate"));
    } finally {
      setCompleteSaving(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success(t("common.deleted"));
      setSheetOpen(false);
      setSelectedBooking(null);
      fetchAll();
    } catch {
      toast.error(t("common.failedDelete"));
    }
  };

  const handleDownloadReport = async (bookingId: number) => {
    setGeneratingReport(true);
    try {
      // Fetch full booking detail with all customer/car/company info
      const fullBooking = await api.get<ReportBooking & { company?: ReportCompany }>(`/bookings/${bookingId}`);
      const company: ReportCompany = fullBooking.company || {
        name: "Company",
      };
      await generateRentalReport(fullBooking, company, currency.code, t);
      toast.success(t("report.generateReport"));
    } catch {
      toast.error(t("bookingsPage.toast.failedLoad"));
    } finally {
      setGeneratingReport(false);
    }
  };

  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async (booking: Booking) => {
    if (!booking.customer?.email) {
      toast.error(t("email.noEmail"));
      return;
    }
    setSendingEmail(true);
    try {
      const fullBooking = await api.get<ReportBooking & { company?: ReportCompany }>(`/bookings/${booking.id}`);
      const company: ReportCompany = fullBooking.company || { name: "Company" };
      const { generateRentalReportDoc } = await import("@/lib/generate-rental-report");
      const doc = await generateRentalReportDoc(fullBooking, company, currency.code, t);
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const fileName = `Rental_Agreement_${booking.id}.pdf`;
      await api.post(`/bookings/${booking.id}/send-email`, { pdfBase64, fileName });
      toast.success(t("email.sent"));
    } catch {
      toast.error(t("email.failed"));
    } finally {
      setSendingEmail(false);
    }
  };

  // Calendar rendering — Berry-style with spanning event bars
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);

    // Build the grid including overflow from previous/next month
    const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
    const prevYear = calMonth === 0 ? calYear - 1 : calYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    type CalDay = { day: number; month: number; year: number; isCurrentMonth: boolean };
    const calDays: CalDay[] = [];

    // Previous month overflow
    for (let i = firstDay - 1; i >= 0; i--) {
      calDays.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      calDays.push({ day: d, month: calMonth, year: calYear, isCurrentMonth: true });
    }
    // Next month overflow
    const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
    const nextYear = calMonth === 11 ? calYear + 1 : calYear;
    const remaining = 7 - (calDays.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        calDays.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
      }
    }
    // Ensure at least 6 rows for consistency
    while (calDays.length < 42) {
      const last = calDays[calDays.length - 1];
      const nd = last.day + 1;
      const nm = nd > getDaysInMonth(last.year, last.month) ? (last.month + 1) % 12 : last.month;
      const ny = nd > getDaysInMonth(last.year, last.month) && last.month === 11 ? last.year + 1 : last.year;
      calDays.push({ day: nm !== last.month ? 1 : nd, month: nm, year: ny, isCurrentMonth: false });
    }

    const weeks: CalDay[][] = [];
    for (let i = 0; i < calDays.length; i += 7) {
      weeks.push(calDays.slice(i, i + 7));
    }

    // Active (non-cancelled) bookings
    const activeBookings = bookings.filter((b) => b.status !== "cancelled");

    // Build a stable color map per booking id
    const bookingColorMap = new Map<number, typeof BOOKING_COLORS[0]>();
    activeBookings.forEach((b, i) => {
      bookingColorMap.set(b.id, BOOKING_COLORS[i % BOOKING_COLORS.length]);
    });

    // Get bookings for a specific date
    const getBookingsForDate = (d: CalDay) => {
      const date = new Date(d.year, d.month, d.day);
      date.setHours(0, 0, 0, 0);
      return activeBookings.filter((b) => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      });
    };

    // Check if a booking starts on this specific day
    const isBookingStart = (b: Booking, d: CalDay) => {
      const start = new Date(b.startDate);
      return start.getFullYear() === d.year && start.getMonth() === d.month && start.getDate() === d.day;
    };

    // Check if this day is a Sunday (start of week) — the booking bar should re-render
    const isDayStartOfWeek = (d: CalDay, dayIndex: number) => dayIndex === 0;

    // Calculate how many days a booking bar should span from this cell
    const getSpanInWeek = (b: Booking, d: CalDay, dayIndex: number) => {
      const end = new Date(b.endDate);
      end.setHours(23, 59, 59, 999);
      const remainingInWeek = 7 - dayIndex;
      let span = 0;
      for (let i = 0; i < remainingInWeek; i++) {
        const checkDate = new Date(d.year, d.month, d.day + i);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate <= end) span++;
        else break;
      }
      return span;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Header with month navigation */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
            if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
            else setCalMonth(calMonth - 1);
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{t(MONTH_KEYS[calMonth])} {calYear}</h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
            if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
            else setCalMonth(calMonth + 1);
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day header row */}
        <div className="grid grid-cols-7 border-b">
          {DAY_KEYS.map((dk) => (
            <div key={dk} className="border-r last:border-r-0 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(dk)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {weeks.map((week, wi) =>
            week.map((d, di) => {
              const dayBookings = getBookingsForDate(d);
              const isToday = d.year === today.getFullYear() && d.month === today.getMonth() && d.day === today.getDate();

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`relative min-h-[120px] border-b border-r p-1.5 transition-colors ${
                    di === 6 ? "border-r-0" : ""
                  } ${wi === weeks.length - 1 ? "border-b-0" : ""} ${
                    !d.isCurrentMonth ? "bg-muted/30" : "bg-card"
                  } ${dayBookings.length > 0 ? "cursor-pointer hover:bg-accent/50" : ""}`}
                  onClick={() => {
                    if (dayBookings.length === 1) {
                      setSelectedBooking(dayBookings[0]);
                      setSheetOpen(true);
                    }
                  }}
                >
                  {/* Day number */}
                  <div className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                    isToday
                      ? "bg-primary font-bold text-primary-foreground"
                      : d.isCurrentMonth
                      ? "font-medium text-foreground"
                      : "text-muted-foreground/50"
                  }`}>
                    {d.day}
                  </div>

                  {/* Booking events */}
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((b) => {
                      const color = bookingColorMap.get(b.id) || BOOKING_COLORS[0];
                      const startsHere = isBookingStart(b, d);
                      const isWeekStart = isDayStartOfWeek(d, di);

                      // Multi-day spanning bar
                      if (startsHere || isWeekStart) {
                        const span = getSpanInWeek(b, d, di);
                        const label = startsHere
                          ? `${b.car?.make} ${b.car?.model} — ${b.customer?.firstName} ${b.customer?.lastName}`
                          : `${b.car?.make} ${b.car?.model}`;
                        const isCompleted = b.status === "completed";

                        return (
                          <div
                            key={b.id}
                            className={`${isCompleted ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400" : `${color.bg} ${color.text}`} relative z-10 cursor-pointer truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 shadow-sm transition-opacity hover:opacity-80 ${isCompleted ? "opacity-50" : ""}`}
                            style={{
                              width: `calc(${span * 100}% + ${(span - 1) * 1}px)`,
                            }}
                            title={`${b.car?.make} ${b.car?.model} — ${b.customer?.firstName} ${b.customer?.lastName} (${new Date(b.startDate).toLocaleDateString(undefined, { timeZone: "UTC" })} → ${new Date(b.endDate).toLocaleDateString(undefined, { timeZone: "UTC" })})`}
                            onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); setSheetOpen(true); }}
                          >
                            {label}
                          </div>
                        );
                      }

                      // Mid-booking day — don't render (the spanning bar covers it)
                      return null;
                    })}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] font-medium text-muted-foreground">
                        {t("common.more", { count: String(dayBookings.length - 3) })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("bookingsPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("bookingsPage.subtitle", { count: String(bookings.length) })}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              {t("bookingsPage.calendarView")}
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="mr-1.5 h-4 w-4" />
              {t("bookingsPage.listView")}
            </Button>
          </div>
          <Button onClick={() => setDialogOpen(true)}>{t("bookingsPage.newBooking")}</Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-52">
          <Label className="mb-1 text-xs text-muted-foreground">{t("bookingsPage.filterByCustomer")}</Label>
          <Select
            value={filterCustomerId}
            onValueChange={(val) => setFilterCustomerId(val === "__all__" ? "" : (val ?? ""))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("bookingsPage.allCustomers")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("bookingsPage.allCustomers")}</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.firstName} {c.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Label className="mb-1 text-xs text-muted-foreground">{t("bookingsPage.filterFrom")}</Label>
          <DatePicker value={filterFrom} onChange={setFilterFrom} placeholder={t("bookingsPage.filterFrom")} />
        </div>
        <div className="w-44">
          <Label className="mb-1 text-xs text-muted-foreground">{t("bookingsPage.filterTo")}</Label>
          <DatePicker value={filterTo} onChange={setFilterTo} placeholder={t("bookingsPage.filterTo")} />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("bookingsPage.clearFilters")}
          </Button>
        )}
      </div>

      {/* Calendar View */}
      {view === "calendar" && renderCalendar()}

      {/* Booking Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
          {selectedBooking && (() => {
            const b = selectedBooking;
            const startDate = new Date(b.startDate);
            const endDate = new Date(b.endDate);
            const formatDate = (d: Date) => d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
            const formatTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
            return (
              <>
                <SheetHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-lg">
                      {b.car?.make} {b.car?.model}
                    </SheetTitle>
                    <Badge
                      variant={
                        b.status === "in_progress" ? "default"
                          : b.status === "completed" ? "secondary"
                          : b.status === "cancelled" ? "destructive"
                          : "outline"
                      }
                    >
                      {t(`bookingsPage.statuses.${b.status}`) || b.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <SheetDescription>
                    {t("bookingsPage.sheetDescription", { id: String(b.id) })}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
                  {/* Car Info */}
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CarIcon className="h-4 w-4 text-primary" />
                      {t("bookingsPage.car")}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("bookingsPage.sheetCarName")}</p>
                        <p className="font-medium">{b.car?.make} {b.car?.model}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("carsPage.licensePlate")}</p>
                        <p className="font-medium">{b.car?.licensePlate || "—"}</p>
                      </div>
                      {b.car?.color && (
                        <div>
                          <p className="text-muted-foreground">{t("carsPage.color")}</p>
                          <p className="font-medium">{t(`carsPage.colors.${b.car.color.toLowerCase()}`).startsWith("carsPage.") ? b.car.color : t(`carsPage.colors.${b.car.color.toLowerCase()}`)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      {t("bookingsPage.customer")}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("customersPage.firstName")}</p>
                        <p className="font-medium">{b.customer?.firstName} {b.customer?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("customersPage.phone")}</p>
                        <p className="font-medium">{b.customer?.phone || "—"}</p>
                      </div>
                      {b.customer?.email && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">{t("customersPage.email")}</p>
                          <p className="font-medium">{b.customer.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secondary Driver Info */}
                  {(b.secondaryDriverName || b.secondaryDriverPhone || b.secondaryDriverIdNumber || b.secondaryDriverLicense) && (
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <User className="h-4 w-4 text-primary" />
                        {t("bookingsPage.secondaryDriver")}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {b.secondaryDriverName && (
                          <div>
                            <p className="text-muted-foreground">{t("bookingsPage.secondaryDriverName")}</p>
                            <p className="font-medium">{b.secondaryDriverName}</p>
                          </div>
                        )}
                        {b.secondaryDriverPhone && (
                          <div>
                            <p className="text-muted-foreground">{t("bookingsPage.secondaryDriverPhone")}</p>
                            <p className="font-medium">{b.secondaryDriverPhone}</p>
                          </div>
                        )}
                        {b.secondaryDriverIdNumber && (
                          <div>
                            <p className="text-muted-foreground">{t("bookingsPage.secondaryDriverIdNumber")}</p>
                            <p className="font-medium">{b.secondaryDriverIdNumber}</p>
                          </div>
                        )}
                        {b.secondaryDriverLicense && (
                          <div>
                            <p className="text-muted-foreground">{t("bookingsPage.secondaryDriverLicense")}</p>
                            <p className="font-medium">{b.secondaryDriverLicense}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates & Location */}
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      {t("bookingsPage.sheetSchedule")}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("bookingsPage.startDate")}</p>
                        <p className="font-medium">{formatDate(startDate)}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("bookingsPage.endDate")}</p>
                        <p className="font-medium">{formatDate(endDate)}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(endDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("bookingsPage.sheetDuration")}</p>
                        <p className="font-medium">{b.totalDays} {t("bookingsPage.sheetDays")}</p>
                      </div>
                      {b.actualReturnDate && (
                        <div>
                          <p className="text-muted-foreground">{t("bookingsPage.sheetActualReturn")}</p>
                          <p className="font-medium">{formatDate(new Date(b.actualReturnDate))}</p>
                        </div>
                      )}
                    </div>
                    {(b.pickupLocation || b.returnLocation) && (
                      <>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {b.pickupLocation && (
                            <div>
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {t("bookingsPage.pickupLocation")}
                              </p>
                              <p className="font-medium">{b.pickupLocation}</p>
                            </div>
                          )}
                          {b.returnLocation && (
                            <div>
                              <p className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {t("bookingsPage.returnLocation")}
                              </p>
                              <p className="font-medium">{b.returnLocation}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Financial */}
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      {t("bookingsPage.sheetFinancial")}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("bookingsPage.dailyRate")}</span>
                        <span className="font-medium">{fc(b.dailyRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("bookingsPage.sheetSubtotal")}</span>
                        <span className="font-medium">{fc(b.subtotal)}</span>
                      </div>
                      {Number(b.discount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>{t("bookingsPage.sheetDiscount")}</span>
                          <span>-{fc(b.discount)}</span>
                        </div>
                      )}
                      {Number(b.extraCharges) > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>{t("bookingsPage.sheetExtraCharges")}</span>
                          <span>+{fc(b.extraCharges)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-base font-semibold">
                        <span>{t("bookingsPage.sheetTotal")}</span>
                        <span>{fc(b.totalAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("bookingsPage.sheetPaid")}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fc(b.amountPaid)}</span>
                          <Badge variant={
                            b.paymentStatus === "paid" ? "secondary"
                              : b.paymentStatus === "partial" ? "outline"
                              : b.paymentStatus === "refunded" ? "destructive"
                              : "outline"
                          } className="text-[10px]">
                            {t(`bookingsPage.paymentStatuses.${b.paymentStatus}`) || b.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mileage */}
                  {(b.mileageOut != null || b.mileageIn != null) && (
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Hash className="h-4 w-4 text-primary" />
                        {t("bookingsPage.sheetMileage")}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {b.mileageOut != null && (
                          <div>
                            <p className="text-muted-foreground">{t("bookingsPage.sheetMileageOut")}</p>
                            <p className="font-medium">{b.mileageOut.toLocaleString()} km</p>
                          </div>
                        )}
                        {b.mileageIn != null && (
                          <div>
                            <p className="text-muted-foreground">{t("bookingsPage.sheetMileageIn")}</p>
                            <p className="font-medium">{b.mileageIn.toLocaleString()} km</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {b.notes && (
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FileText className="h-4 w-4 text-primary" />
                        {t("bookingsPage.sheetNotes")}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{b.notes}</p>
                    </div>
                  )}

                  {/* Created Info */}
                  <div className="text-xs text-muted-foreground">
                    {t("bookingsPage.sheetCreatedAt", { date: new Date(b.createdAt).toLocaleString(undefined, { timeZone: "UTC" }) })}
                    {b.createdBy && (
                      <span> · {t("bookingsPage.sheetCreatedBy", { name: `${b.createdBy.firstName} ${b.createdBy.lastName}` })}</span>
                    )}
                  </div>

                </div>

                {/* Action Buttons — sticky footer */}
                <div className="flex flex-col gap-2 border-t px-4 py-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={generatingReport}
                    onClick={() => handleDownloadReport(b.id)}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    {generatingReport ? t("report.generating") : t("report.generateReport")}
                  </Button>
                  {b.customer?.email && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={sendingEmail}
                      onClick={() => handleSendEmail(b)}
                    >
                      <Mail className="mr-1.5 h-4 w-4" />
                      {sendingEmail ? t("email.sending") : t("email.sendToClient")}
                    </Button>
                  )}
                  {b.status === "cancelled" && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteBooking(b.id)}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      {t("common.delete")}
                    </Button>
                  )}
                  {b.status !== "completed" && b.status !== "cancelled" && (
                    <div className="flex gap-2">
                      {b.status === "pending_start" && (
                        <Button className="flex-1" onClick={() => handleStartBooking(b)}>
                          <Play className="mr-1.5 h-4 w-4" />
                          {t("bookingsPage.start")}
                        </Button>
                      )}
                      {b.status === "in_progress" && (
                        <Button className="flex-1" onClick={() => handleCompleteBooking(b)}>
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          {t("bookingsPage.complete")}
                        </Button>
                      )}
                      {(b.status === "pending_start" || b.status === "in_progress") && (
                        <Button variant="outline" className="flex-1" onClick={() => { updateStatus(b.id, "cancelled"); setSheetOpen(false); }}>
                          <XCircle className="mr-1.5 h-4 w-4" />
                          {t("common.cancel")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* Start Booking Dialog — upload pre-start images */}
      <Dialog open={startDialogOpen} onOpenChange={(open) => { if (!open) { setStartDialogOpen(false); setStartingBooking(null); setPreStartImages([]); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("bookingsPage.startBookingTitle")}</DialogTitle>
            <DialogDescription>{t("bookingsPage.startBookingDescription")}</DialogDescription>
          </DialogHeader>
          {startingBooking && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{startingBooking.car?.make} {startingBooking.car?.model} — {startingBooking.customer?.firstName} {startingBooking.customer?.lastName}</p>
                <p className="text-muted-foreground text-xs">{startingBooking.car?.licensePlate}</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {t("bookingsPage.preStartImages")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("bookingsPage.preStartImagesHint")}</p>
                <ImageUpload images={preStartImages} onChange={setPreStartImages} max={20} allowVideo />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setStartDialogOpen(false); setStartingBooking(null); setPreStartImages([]); }}>{t("common.cancel")}</Button>
                <Button onClick={handleConfirmStart} disabled={startingSaving}>
                  <Play className="mr-1.5 h-4 w-4" />
                  {startingSaving ? t("bookingsPage.startingBooking") : t("bookingsPage.startBooking")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complete Booking Dialog — review pre-start images + payment settlement */}
      <Dialog open={completeDialogOpen} onOpenChange={(open) => { if (!open) { setCompleteDialogOpen(false); setCompletingBooking(null); setCompletingBookingFull(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{settlementStep === "review" ? t("bookingsPage.completeBookingTitle") : t("payment.settlementTitle")}</DialogTitle>
            <DialogDescription>{settlementStep === "review" ? t("bookingsPage.completeBookingDescription") : t("payment.settlementDescription")}</DialogDescription>
          </DialogHeader>
          {completingBooking && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{completingBooking.car?.make} {completingBooking.car?.model} — {completingBooking.customer?.firstName} {completingBooking.customer?.lastName}</p>
                <p className="text-muted-foreground text-xs">{completingBooking.car?.licensePlate}</p>
              </div>

              {settlementStep === "review" ? (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      {t("bookingsPage.preStartImages")}
                    </Label>
                    {completingBookingFull?.bookingImages && completingBookingFull.bookingImages.filter((img) => img.type === "pre_start").length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {completingBookingFull.bookingImages.filter((img) => img.type === "pre_start").map((img) => (
                          <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                            {img.url.startsWith("data:video/") ? (
                              <video src={img.url} className="h-full w-full object-cover" controls muted playsInline preload="metadata" />
                            ) : (
                              <img src={img.url} alt="Pre-start" className="h-full w-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">{t("bookingsPage.noPreStartImages")}</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => { setCompleteDialogOpen(false); setCompletingBooking(null); setCompletingBookingFull(null); }}>{t("common.cancel")}</Button>
                    <Button onClick={() => setSettlementStep("payment")}>
                      {t("common.next")}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Payment settlement */}
                  {(() => {
                    const total = parseFloat(String(completingBookingFull?.totalAmount ?? completingBooking.totalAmount ?? 0));
                    const alreadyPaid = parseFloat(String(completingBookingFull?.amountPaid ?? completingBooking.amountPaid ?? 0));
                    const extra = settleExtraCharges ? parseFloat(settleExtraCharges) : 0;
                    const adjustedTotal = total + extra;
                    const paymentEntered = settlePaymentAmount ? parseFloat(settlePaymentAmount) : alreadyPaid;
                    const remaining = adjustedTotal - paymentEntered;

                    return (
                      <div className="space-y-4">
                        {/* Financial summary */}
                        <div className="rounded-lg border p-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t("payment.totalAmount")}</span>
                            <span className="font-medium">{fc(total)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t("bookingsPage.amountPaid")}</span>
                            <span className="font-medium">{fc(alreadyPaid)}</span>
                          </div>
                          {extra > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t("payment.extraCharges")}</span>
                              <span className="font-medium text-amber-600">+{fc(extra)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex items-center justify-between text-sm font-semibold">
                            <span>{t("payment.remainingBalance")}</span>
                            <span className={remaining > 0 ? "text-red-600" : remaining < 0 ? "text-amber-600" : "text-emerald-600"}>
                              {remaining > 0 ? fc(remaining) : remaining < 0 ? `${t("payment.exceeded")} ${fc(Math.abs(remaining))}` : t("payment.fullyPaid")}
                            </span>
                          </div>
                        </div>

                        {/* Mileage in */}
                        <div className="space-y-2">
                          <Label>{t("payment.mileageIn")}</Label>
                          <Input
                            type="number"
                            value={settleMileageIn}
                            onChange={(e) => setSettleMileageIn(e.target.value)}
                            placeholder={completingBooking.mileageOut ? String(completingBooking.mileageOut) : "0"}
                          />
                        </div>

                        {/* Extra charges */}
                        <div className="space-y-2">
                          <Label>{t("payment.extraCharges")}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={settleExtraCharges}
                            onChange={(e) => setSettleExtraCharges(e.target.value)}
                            placeholder="0"
                          />
                        </div>

                        {/* Payment amount */}
                        <div className="space-y-2">
                          <Label>{t("payment.enterPayment")}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={settlePaymentAmount}
                            onChange={(e) => setSettlePaymentAmount(e.target.value)}
                            placeholder={String(adjustedTotal)}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button type="button" variant="outline" onClick={() => setSettlementStep("review")}>
                            {t("common.back")}
                          </Button>
                          <Button onClick={handleConfirmComplete} disabled={completeSaving}>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            {completeSaving ? t("common.saving") : t("bookingsPage.complete")}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Customer Creation Sheet */}
      <Sheet open={quickCustomerOpen} onOpenChange={setQuickCustomerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("quickCustomer.title")}</SheetTitle>
            <SheetDescription>{t("quickCustomer.description")}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleQuickCustomerCreate} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("customersPage.firstName")} *</Label>
                  <Input value={quickCustomerForm.firstName} onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.lastName")} *</Label>
                  <Input value={quickCustomerForm.lastName} onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.email")}</Label>
                <Input type="email" value={quickCustomerForm.email} onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.phone")}</Label>
                <Input value={quickCustomerForm.phone} onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.idNumber")}</Label>
                <Input value={quickCustomerForm.idNumber} onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, idNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.personalNumber")}</Label>
                <Input value={quickCustomerForm.personalNumber} onChange={(e) => setQuickCustomerForm({ ...quickCustomerForm, personalNumber: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 border-t p-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setQuickCustomerOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" className="flex-1" disabled={quickCustomerSaving}>
                {quickCustomerSaving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* List View */}
      {view === "list" && (
        <DataTable<Booking>
          data={bookings}
          columns={[
            {
              key: "customer",
              header: t("bookingsPage.tableHeaders.customer"),
              sortValue: (b) => `${b.customer?.firstName ?? ""} ${b.customer?.lastName ?? ""}`,
              render: (b) => (
                <span className="font-medium">
                  {b.customer?.firstName} {b.customer?.lastName}
                </span>
              ),
            },
            {
              key: "car",
              header: t("bookingsPage.tableHeaders.car"),
              sortValue: (b) => `${b.car?.make ?? ""} ${b.car?.model ?? ""}`,
              render: (b) => (
                <div>
                  <span>{b.car?.make} {b.car?.model}</span>
                  {b.car?.licensePlate && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({b.car.licensePlate})</span>
                  )}
                </div>
              ),
            },
            {
              key: "dates",
              header: t("bookingsPage.tableHeaders.dates"),
              sortValue: (b) => new Date(b.startDate).getTime(),
              render: (b) => (
                <span className="text-sm">
                  {new Date(b.startDate).toLocaleDateString(undefined, { timeZone: "UTC" })} → {new Date(b.endDate).toLocaleDateString(undefined, { timeZone: "UTC" })}
                </span>
              ),
            },
            {
              key: "cost",
              header: t("bookingsPage.tableHeaders.cost"),
              sortValue: (b) => b.totalAmount || 0,
              render: (b) => <span>{b.totalAmount ? fc(b.totalAmount) : "—"}</span>,
            },
            {
              key: "status",
              header: t("bookingsPage.tableHeaders.status"),
              sortValue: (b) => b.status,
              render: (b) => (
                <Badge
                  variant={
                    b.status === "in_progress" ? "default"
                      : b.status === "completed" ? "secondary"
                      : b.status === "cancelled" ? "destructive"
                      : "outline"
                  }
                >
                  {t(`bookingsPage.statuses.${b.status}`) || b.status.replace(/_/g, " ")}
                </Badge>
              ),
            },
          ]}
          getRowId={(b) => b.id}
          searchFn={(b, q) =>
            `${b.customer?.firstName ?? ""} ${b.customer?.lastName ?? ""} ${b.car?.make ?? ""} ${b.car?.model ?? ""} ${b.car?.licensePlate ?? ""} ${b.status}`.toLowerCase().includes(q)
          }
          onRowClick={(b) => { setSelectedBooking(b); setSheetOpen(true); }}
          actions={[
            {
              label: t("common.view"),
              icon: <Eye className="h-4 w-4" />,
              onClick: (b) => { setSelectedBooking(b); setSheetOpen(true); },
            },
            {
              label: t("bookingsPage.downloadReport"),
              icon: <Download className="h-4 w-4" />,
              onClick: (b) => handleDownloadReport(b.id),
            },
            {
              label: t("bookingsPage.start"),
              icon: <Play className="h-4 w-4" />,
              onClick: (b) => handleStartBooking(b),
              hidden: (b) => b.status !== "pending_start",
            },
            {
              label: t("bookingsPage.complete"),
              icon: <CheckCircle2 className="h-4 w-4" />,
              onClick: (b) => handleCompleteBooking(b),
              hidden: (b) => b.status !== "in_progress",
            },
            {
              label: t("common.cancel"),
              icon: <XCircle className="h-4 w-4" />,
              onClick: (b) => updateStatus(b.id, "cancelled"),
              variant: "destructive",
              hidden: (b) => b.status !== "pending_start" && b.status !== "in_progress",
            },
            {
              label: t("common.delete"),
              icon: <Trash2 className="h-4 w-4" />,
              onClick: (b) => handleDeleteBooking(b.id),
              variant: "destructive",
              hidden: (b) => b.status !== "cancelled",
            },
          ]}
          emptyMessage={hasActiveFilters ? t("bookingsPage.noBookingsFilter") : t("bookingsPage.emptyState")}
          defaultSortKey="dates"
          defaultSortDir="desc"
        />
      )}

      {/* New Booking Sheet */}
      <Sheet open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setPendingRequestId(null);
          setPendingRequestInfo(null);
        }
      }}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
          <SheetHeader className="border-b">
            <div className="flex items-center gap-2">
              <SheetTitle>
                {pendingRequestId
                  ? t("bookingsPage.confirmRequestTitle")
                  : t("bookingsPage.dialogTitle")}
              </SheetTitle>
              {pendingRequestInfo && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0 rounded-full"
                  onClick={() => setRequestInfoOpen(true)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
            </div>
            <SheetDescription>
              {pendingRequestId
                ? t("bookingsPage.confirmRequestDescription")
                : t("bookingsPage.dialogDescription")}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleCreate} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Customer */}
              <div className="space-y-2">
                <Label>{t("bookingsPage.customer")} *</Label>
                <div className="flex gap-2">
                  <Select value={form.customerId} onValueChange={(val) => setForm({ ...form, customerId: val ?? "" })}>
                    <SelectTrigger className="w-full">
                      {form.customerId
                        ? (() => { const c = customers.find((c) => String(c.id) === form.customerId); return c ? `${c.firstName} ${c.lastName} (${c.phone})` : t("bookingsPage.selectCustomer"); })()
                        : <SelectValue placeholder={t("bookingsPage.selectCustomer")} />}
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.firstName} {c.lastName} ({c.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => {
                    if (pendingRequestInfo) {
                      setQuickCustomerForm({
                        firstName: pendingRequestInfo.requesterFirstName,
                        lastName: pendingRequestInfo.requesterLastName,
                        email: pendingRequestInfo.requesterEmail || "",
                        phone: pendingRequestInfo.requesterPhone,
                        idNumber: "",
                        personalNumber: "",
                      });
                    }
                    setQuickCustomerOpen(true);
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Car */}
              <div className="space-y-2">
                <Label>{t("bookingsPage.car")} *</Label>
                <Select
                  value={form.carId}
                  onValueChange={(val) => {
                    const car = cars.find((c) => String(c.id) === val);
                    setForm({
                      ...form,
                      carId: val ?? "",
                      dailyRate: car?.dailyRate ? String(car.dailyRate) : form.dailyRate,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    {form.carId
                      ? (() => { const c = cars.find((c) => String(c.id) === form.carId); return c ? `${c.make} ${c.model} (${c.licensePlate})` : t("bookingsPage.selectCar"); })()
                      : <SelectValue placeholder={t("bookingsPage.selectCar")} />}
                  </SelectTrigger>
                  <SelectContent>
                    {cars.filter((c) => c.status === "available" || String(c.id) === form.carId).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.make} {c.model} ({c.licensePlate}) — {fc(c.dailyRate)}/{t("bookingsPage.perDay")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start & End dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("bookingsPage.startDate")} *</Label>
                  <DateTimePicker value={form.startDate} onChange={(val) => setForm({ ...form, startDate: val })} minDate={new Date()} />
                </div>
                <div className="space-y-2">
                  <Label>{t("bookingsPage.endDate")} *</Label>
                  <DateTimePicker value={form.endDate} onChange={(val) => setForm({ ...form, endDate: val })} minDate={new Date()} />
                </div>
              </div>

              {/* Daily Rate & Discount */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("bookingsPage.dailyRate")}</Label>
                  <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("bookingsPage.sheetDiscount")}</Label>
                  <Input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                </div>
              </div>

              {/* Pickup & Return locations */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("bookingsPage.pickupLocation")}</Label>
                  {deliveryPoints.length > 0 && !pickupCustom ? (
                    <Select
                      value={form.pickupLocation}
                      onValueChange={(val) => {
                        if (val === "__custom__") {
                          setPickupCustom(true);
                          setForm({ ...form, pickupLocation: "" });
                        } else {
                          setForm({ ...form, pickupLocation: val ?? "" });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("bookingsPage.selectLocation")} />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryPoints.map((dp) => (
                          <SelectItem key={dp.id} value={dp.name}>
                            {dp.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">{t("bookingsPage.customLocation")}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={form.pickupLocation}
                        onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                        placeholder={t("bookingsPage.pickupLocation")}
                        className="flex-1"
                      />
                      {deliveryPoints.length > 0 && pickupCustom && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            setPickupCustom(false);
                            setForm({ ...form, pickupLocation: "" });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("bookingsPage.returnLocation")}</Label>
                  {deliveryPoints.length > 0 && !returnCustom ? (
                    <Select
                      value={form.returnLocation}
                      onValueChange={(val) => {
                        if (val === "__custom__") {
                          setReturnCustom(true);
                          setForm({ ...form, returnLocation: "" });
                        } else {
                          setForm({ ...form, returnLocation: val ?? "" });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("bookingsPage.selectLocation")} />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryPoints.map((dp) => (
                          <SelectItem key={dp.id} value={dp.name}>
                            {dp.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">{t("bookingsPage.customLocation")}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={form.returnLocation}
                        onChange={(e) => setForm({ ...form, returnLocation: e.target.value })}
                        placeholder={t("bookingsPage.returnLocation")}
                        className="flex-1"
                      />
                      {deliveryPoints.length > 0 && returnCustom && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            setReturnCustom(false);
                            setForm({ ...form, returnLocation: "" });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Mileage Out */}
              <div className="space-y-2">
                <Label>{t("bookingsPage.sheetMileageOut")}</Label>
                <Input type="number" value={form.mileageOut} onChange={(e) => setForm({ ...form, mileageOut: e.target.value })} placeholder="km" />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>{t("bookingsPage.sheetNotes")}</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>

              {/* Secondary Driver */}
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">{t("bookingsPage.secondaryDriverOptional")}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.secondaryDriverName")}</Label>
                    <Input value={form.secondaryDriverName} onChange={(e) => setForm({ ...form, secondaryDriverName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.secondaryDriverPhone")}</Label>
                    <Input value={form.secondaryDriverPhone} onChange={(e) => setForm({ ...form, secondaryDriverPhone: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.secondaryDriverIdNumber")}</Label>
                    <Input value={form.secondaryDriverIdNumber} onChange={(e) => setForm({ ...form, secondaryDriverIdNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.secondaryDriverLicense")}</Label>
                    <Input value={form.secondaryDriverLicense} onChange={(e) => setForm({ ...form, secondaryDriverLicense: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter className="border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? t("bookingsPage.creating")
                  : pendingRequestId
                    ? t("bookingsPage.confirmAndCreate")
                    : t("bookingsPage.createBooking")}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Booking Request Info Dialog */}
      <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("bookingsPage.requestInfoTitle")}</DialogTitle>
            <DialogDescription>{t("bookingsPage.requestInfoDescription")}</DialogDescription>
          </DialogHeader>
          {pendingRequestInfo && (
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {pendingRequestInfo.requesterFirstName} {pendingRequestInfo.requesterLastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{pendingRequestInfo.requesterPhone}</span>
                </div>
                {pendingRequestInfo.requesterEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{pendingRequestInfo.requesterEmail}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center gap-2">
                  <CarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{pendingRequestInfo.carName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {pendingRequestInfo.startDate.replace("T", " ")} — {pendingRequestInfo.endDate.replace("T", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{pendingRequestInfo.totalDays} {t("bookingsPage.sheetDays")}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingsPage.dailyRate")}</span>
                  <span className="font-medium">{fc(pendingRequestInfo.dailyRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingsPage.sheetTotal")}</span>
                  <span className="text-lg font-bold">{fc(pendingRequestInfo.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsPageContent />
    </Suspense>
  );
}
