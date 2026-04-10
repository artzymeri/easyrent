import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { generateRentalReport, type ReportBooking, type ReportCompany } from "@/lib/generate-rental-report";
import type { ImageItem } from "@/components/image-upload";
import { toast } from "sonner";
import type { CustomerPrefill } from "@/components/customer-create-sheet";

import type { Booking, Car, Customer, DeliveryPoint, BookingForm, PendingRequestInfo } from "./types";
import { EMPTY_FORM } from "./types";
import { useBookingRequestPrefill } from "./use-booking-request-prefill";

export function useBookings() {
  const { t } = useTranslation();
  const { currency } = useCurrency();
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

  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);

  // Start booking dialog state
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [startingBooking, setStartingBooking] = useState<Booking | null>(null);
  const [preStartImages, setPreStartImages] = useState<ImageItem[]>([]);
  const [startingSaving, setStartingSaving] = useState(false);
  const [pickupCustom, setPickupCustom] = useState(false);
  const [returnCustom, setReturnCustom] = useState(false);

  // Customer creation sheet
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const [customerPrefill, setCustomerPrefill] = useState<CustomerPrefill | null>(null);

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
  const [pendingRequestInfo, setPendingRequestInfo] = useState<PendingRequestInfo | null>(null);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);

  const hasActiveFilters = filterCustomerId !== "" || filterFrom !== "" || filterTo !== "";

  const [sendingEmail, setSendingEmail] = useState(false);

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
  useBookingRequestPrefill({
    loading,
    pendingRequestId,
    setPendingRequestId,
    setPendingRequestInfo,
    setForm,
    setDialogOpen,
  });

  const applyFilters = async () => {
    setLoading(true);
    try {
      const data = await fetchBookings(filterCustomerId, filterFrom, filterTo);
      setBookings(data);
    } catch { toast.error(t("bookingsPage.toast.failedLoad")); }
    finally { setLoading(false); }
  };

  const clearFilters = async () => {
    setFilterCustomerId(""); setFilterFrom(""); setFilterTo("");
    setLoading(true);
    try {
      const data = await fetchBookings("", "", "");
      setBookings(data);
    } catch { toast.error(t("bookingsPage.toast.failedLoad")); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!loading) { applyFilters(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCustomerId, filterFrom, filterTo]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carId || !form.customerId || !form.startDate || !form.endDate) {
      toast.error(t("bookingsPage.validation.required")); return;
    }
    setSaving(true);
    try {
      await api.post("/bookings", {
        carId: parseInt(form.carId), customerId: parseInt(form.customerId),
        startDate: form.startDate, endDate: form.endDate,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
        pickupLocation: form.pickupLocation, returnLocation: form.returnLocation,
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
      setForm(EMPTY_FORM);
      setPendingRequestId(null); setPendingRequestInfo(null);
      setPickupCustom(false); setReturnCustom(false);
      setDialogOpen(false);
      fetchAll();
    } catch { toast.error(t("bookingsPage.toast.failedCreate")); }
    finally { setSaving(false); }
  };

  const updateStatus = async (bookingId: number, status: string, extra?: Record<string, unknown>) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status, ...extra });
      toast.success(t("bookingsPage.toast.statusUpdated")); fetchAll();
    } catch { toast.error(t("bookingsPage.toast.failedUpdate")); }
  };

  const handleStartBooking = (booking: Booking) => {
    setStartingBooking(booking); setPreStartImages([]); setStartDialogOpen(true);
  };

  const handleConfirmStart = async () => {
    if (!startingBooking) return;
    setStartingSaving(true);
    try {
      const imageUrls = preStartImages.map((img) => img.url);
      await api.put(`/bookings/${startingBooking.id}/status`, { status: "in_progress", preStartImages: imageUrls });
      toast.success(t("bookingsPage.toast.statusUpdated"));
      setStartDialogOpen(false); setStartingBooking(null); setPreStartImages([]);
      setSheetOpen(false); fetchAll();
    } catch { toast.error(t("bookingsPage.toast.failedUpdate")); }
    finally { setStartingSaving(false); }
  };

  const handleCompleteBooking = async (booking: Booking) => {
    setCompletingBooking(booking); setCompleteDialogOpen(true);
    setSettlementStep("review"); setSettleMileageIn(""); setSettleExtraCharges(""); setSettlePaymentAmount("");
    try { setCompletingBookingFull(await api.get<Booking>(`/bookings/${booking.id}`)); }
    catch { setCompletingBookingFull(null); }
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
      setCompleteDialogOpen(false); setCompletingBooking(null); setCompletingBookingFull(null);
      setSheetOpen(false); fetchAll();
    } catch { toast.error(t("bookingsPage.toast.failedUpdate")); }
    finally { setCompleteSaving(false); }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success(t("common.deleted"));
      setSheetOpen(false); setSelectedBooking(null); fetchAll();
    } catch { toast.error(t("common.failedDelete")); }
  };

  const handleDownloadReport = async (bookingId: number) => {
    setGeneratingReport(true);
    try {
      const fullBooking = await api.get<ReportBooking & { company?: ReportCompany }>(`/bookings/${bookingId}`);
      const company: ReportCompany = fullBooking.company || { name: "Company" };
      await generateRentalReport(fullBooking, company, currency.code, t);
      toast.success(t("report.generateReport"));
    } catch { toast.error(t("bookingsPage.toast.failedLoad")); }
    finally { setGeneratingReport(false); }
  };

  const handleSendEmail = async (booking: Booking) => {
    if (!booking.customer?.email) { toast.error(t("email.noEmail")); return; }
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
    } catch { toast.error(t("email.failed")); }
    finally { setSendingEmail(false); }
  };

  const handleSelectBooking = (b: Booking) => {
    setSelectedBooking(b); setSheetOpen(true);
  };

  return {
    // Data
    bookings, cars, customers, deliveryPoints, loading,
    // View state
    view, setView, calYear, setCalYear, calMonth, setCalMonth,
    // Detail sheet
    selectedBooking, sheetOpen, setSheetOpen,
    // Form / New booking sheet
    form, setForm, dialogOpen, setDialogOpen, saving,
    pickupCustom, setPickupCustom, returnCustom, setReturnCustom,
    // Start booking
    startDialogOpen, setStartDialogOpen, startingBooking,
    preStartImages, setPreStartImages, startingSaving,
    // Complete booking
    completeDialogOpen, setCompleteDialogOpen, completingBooking,
    completingBookingFull, settlementStep, setSettlementStep,
    settleMileageIn, setSettleMileageIn, settleExtraCharges, setSettleExtraCharges,
    settlePaymentAmount, setSettlePaymentAmount, completeSaving,
    // Customer creation
    quickCustomerOpen, setQuickCustomerOpen, customerPrefill, setCustomerPrefill,
    setCustomers,
    // Filters
    filterCustomerId, setFilterCustomerId,
    filterFrom, setFilterFrom, filterTo, setFilterTo,
    hasActiveFilters, clearFilters,
    // Booking request
    pendingRequestId, setPendingRequestId,
    pendingRequestInfo, setPendingRequestInfo,
    requestInfoOpen, setRequestInfoOpen,
    // Report / Email
    generatingReport, sendingEmail,
    // Handlers
    handleCreate, handleSelectBooking, handleStartBooking, handleConfirmStart,
    handleCompleteBooking, handleConfirmComplete,
    handleDeleteBooking, handleDownloadReport, handleSendEmail, updateStatus,
  };
}
