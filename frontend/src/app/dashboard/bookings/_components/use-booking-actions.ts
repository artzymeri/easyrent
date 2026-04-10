import { api } from "@/lib/api";
import { generateRentalReport, type ReportBooking, type ReportCompany } from "@/lib/generate-rental-report";
import { toast } from "sonner";
import type { Booking, BookingForm } from "./types";
import { EMPTY_FORM } from "./types";

interface ActionDeps {
  t: (key: string, params?: Record<string, string>) => string;
  currencyCode: string;
  form: BookingForm;
  pendingRequestId: number | null;
  startingBooking: Booking | null;
  preStartImages: { url: string }[];
  completingBooking: Booking | null;
  settleMileageIn: string;
  settleExtraCharges: string;
  settlePaymentAmount: string;
  // Setters
  setSaving: (v: boolean) => void;
  setForm: (v: BookingForm) => void;
  setPendingRequestId: (v: number | null) => void;
  setPendingRequestInfo: (v: null) => void;
  setPickupCustom: (v: boolean) => void;
  setReturnCustom: (v: boolean) => void;
  setDialogOpen: (v: boolean) => void;
  setGeneratingReport: (v: boolean) => void;
  setSendingEmail: (v: boolean) => void;
  setStartingSaving: (v: boolean) => void;
  setStartDialogOpen: (v: boolean) => void;
  setStartingBooking: (v: Booking | null) => void;
  setPreStartImages: (v: never[]) => void;
  setSheetOpen: (v: boolean) => void;
  setCompleteSaving: (v: boolean) => void;
  setCompleteDialogOpen: (v: boolean) => void;
  setCompletingBooking: (v: Booking | null) => void;
  setCompletingBookingFull: (v: Booking | null) => void;
  setSettlementStep: (v: "review" | "payment") => void;
  setSettleMileageIn: (v: string) => void;
  setSettleExtraCharges: (v: string) => void;
  setSettlePaymentAmount: (v: string) => void;
  setSelectedBooking: (v: Booking | null) => void;
  fetchAll: () => Promise<void>;
}

export function createBookingActions(deps: ActionDeps) {
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deps.form.carId || !deps.form.customerId || !deps.form.startDate || !deps.form.endDate) {
      toast.error(deps.t("bookingsPage.validation.required")); return;
    }
    deps.setSaving(true);
    try {
      await api.post("/bookings", {
        carId: parseInt(deps.form.carId), customerId: parseInt(deps.form.customerId),
        startDate: deps.form.startDate, endDate: deps.form.endDate,
        dailyRate: deps.form.dailyRate ? parseFloat(deps.form.dailyRate) : undefined,
        pickupLocation: deps.form.pickupLocation, returnLocation: deps.form.returnLocation,
        discount: deps.form.discount ? parseFloat(deps.form.discount) : undefined,
        mileageOut: deps.form.mileageOut ? parseInt(deps.form.mileageOut) : undefined,
        notes: deps.form.notes || undefined,
        secondaryDriverName: deps.form.secondaryDriverName || undefined,
        secondaryDriverPhone: deps.form.secondaryDriverPhone || undefined,
        secondaryDriverIdNumber: deps.form.secondaryDriverIdNumber || undefined,
        secondaryDriverLicense: deps.form.secondaryDriverLicense || undefined,
        bookingRequestId: deps.pendingRequestId || undefined,
      });
      toast.success(deps.t("bookingsPage.toast.created"));
      deps.setForm(EMPTY_FORM);
      deps.setPendingRequestId(null); deps.setPendingRequestInfo(null);
      deps.setPickupCustom(false); deps.setReturnCustom(false);
      deps.setDialogOpen(false);
      deps.fetchAll();
    } catch { toast.error(deps.t("bookingsPage.toast.failedCreate")); }
    finally { deps.setSaving(false); }
  };

  const updateStatus = async (bookingId: number, status: string, extra?: Record<string, unknown>) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status, ...extra });
      toast.success(deps.t("bookingsPage.toast.statusUpdated")); deps.fetchAll();
    } catch { toast.error(deps.t("bookingsPage.toast.failedUpdate")); }
  };

  const handleStartBooking = (booking: Booking) => {
    deps.setStartingBooking(booking); deps.setPreStartImages([]); deps.setStartDialogOpen(true);
  };

  const handleConfirmStart = async () => {
    if (!deps.startingBooking) return;
    deps.setStartingSaving(true);
    try {
      const imageUrls = deps.preStartImages.map((img) => img.url);
      await api.put(`/bookings/${deps.startingBooking.id}/status`, { status: "in_progress", preStartImages: imageUrls });
      toast.success(deps.t("bookingsPage.toast.statusUpdated"));
      deps.setStartDialogOpen(false); deps.setStartingBooking(null); deps.setPreStartImages([]);
      deps.setSheetOpen(false); deps.fetchAll();
    } catch { toast.error(deps.t("bookingsPage.toast.failedUpdate")); }
    finally { deps.setStartingSaving(false); }
  };

  const handleCompleteBooking = async (booking: Booking) => {
    deps.setCompletingBooking(booking); deps.setCompleteDialogOpen(true);
    deps.setSettlementStep("review"); deps.setSettleMileageIn(""); deps.setSettleExtraCharges(""); deps.setSettlePaymentAmount("");
    try { deps.setCompletingBookingFull(await api.get<Booking>(`/bookings/${booking.id}`)); }
    catch { deps.setCompletingBookingFull(null); }
  };

  const handleConfirmComplete = async () => {
    if (!deps.completingBooking) return;
    deps.setCompleteSaving(true);
    try {
      const body: Record<string, unknown> = { status: "completed" };
      if (deps.settleMileageIn) body.mileageIn = parseInt(deps.settleMileageIn);
      if (deps.settleExtraCharges) body.extraCharges = parseFloat(deps.settleExtraCharges);
      if (deps.settlePaymentAmount) body.amountPaid = parseFloat(deps.settlePaymentAmount);
      await api.put(`/bookings/${deps.completingBooking.id}/status`, body);
      toast.success(deps.t("bookingsPage.toast.statusUpdated"));
      deps.setCompleteDialogOpen(false); deps.setCompletingBooking(null); deps.setCompletingBookingFull(null);
      deps.setSheetOpen(false); deps.fetchAll();
    } catch { toast.error(deps.t("bookingsPage.toast.failedUpdate")); }
    finally { deps.setCompleteSaving(false); }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm(deps.t("common.confirmDelete"))) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success(deps.t("common.deleted"));
      deps.setSheetOpen(false); deps.setSelectedBooking(null); deps.fetchAll();
    } catch { toast.error(deps.t("common.failedDelete")); }
  };

  const handleDownloadReport = async (bookingId: number) => {
    deps.setGeneratingReport(true);
    try {
      const fullBooking = await api.get<ReportBooking & { company?: ReportCompany }>(`/bookings/${bookingId}`);
      const company: ReportCompany = fullBooking.company || { name: "Company" };
      await generateRentalReport(fullBooking, company, deps.currencyCode, deps.t);
      toast.success(deps.t("report.generateReport"));
    } catch { toast.error(deps.t("bookingsPage.toast.failedLoad")); }
    finally { deps.setGeneratingReport(false); }
  };

  const handleSendEmail = async (booking: Booking) => {
    if (!booking.customer?.email) { toast.error(deps.t("email.noEmail")); return; }
    deps.setSendingEmail(true);
    try {
      const fullBooking = await api.get<ReportBooking & { company?: ReportCompany }>(`/bookings/${booking.id}`);
      const company: ReportCompany = fullBooking.company || { name: "Company" };
      const { generateRentalReportDoc } = await import("@/lib/generate-rental-report");
      const doc = await generateRentalReportDoc(fullBooking, company, deps.currencyCode, deps.t);
      const pdfBase64 = doc.output("datauristring").split(",")[1];
      const fileName = `Rental_Agreement_${booking.id}.pdf`;
      await api.post(`/bookings/${booking.id}/send-email`, { pdfBase64, fileName });
      toast.success(deps.t("email.sent"));
    } catch { toast.error(deps.t("email.failed")); }
    finally { deps.setSendingEmail(false); }
  };

  const handleSelectBooking = (b: Booking) => {
    deps.setSelectedBooking(b); deps.setSheetOpen(true);
  };

  return {
    handleCreate, updateStatus, handleStartBooking, handleConfirmStart,
    handleCompleteBooking, handleConfirmComplete, handleDeleteBooking,
    handleDownloadReport, handleSendEmail, handleSelectBooking,
  };
}
