import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

import type { BookingForm, PendingRequestInfo } from "./types";

interface UseBookingRequestPrefillParams {
  loading: boolean;
  pendingRequestId: number | null;
  setPendingRequestId: (id: number | null) => void;
  setPendingRequestInfo: (info: PendingRequestInfo | null) => void;
  setForm: (form: BookingForm) => void;
  setDialogOpen: (open: boolean) => void;
}

export function useBookingRequestPrefill({
  loading,
  pendingRequestId,
  setPendingRequestId,
  setPendingRequestInfo,
  setForm,
  setDialogOpen,
}: UseBookingRequestPrefillParams) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fromRequest = searchParams.get("fromRequest");
    if (!fromRequest || loading) return;
    const requestId = parseInt(fromRequest);
    if (isNaN(requestId)) return;
    if (pendingRequestId === requestId) return;
    setPendingRequestId(requestId);

    (async () => {
      try {
        const req = await api.get<{
          id: number; carId: number; startDate: string; endDate: string;
          dailyRate: string; totalDays: number; totalAmount: string;
          requesterFirstName: string; requesterLastName: string;
          requesterEmail: string | null; requesterPhone: string;
          car: { id: number; make: string; model: string; licensePlate: string; dailyRate: string };
        }>(`/booking-requests/${requestId}`);

        const normalizeDate = (dateStr: string) => {
          const d = new Date(dateStr);
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(d.getUTCDate()).padStart(2, "0");
          const hh = String(d.getUTCHours()).padStart(2, "0");
          const min = String(d.getUTCMinutes()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        };

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

        setForm({
          carId: String(req.carId), customerId: "",
          startDate: normalizeDate(req.startDate), endDate: normalizeDate(req.endDate),
          dailyRate: String(req.dailyRate), pickupLocation: "", returnLocation: "",
          discount: "", mileageOut: "", notes: "",
          secondaryDriverName: "", secondaryDriverPhone: "",
          secondaryDriverIdNumber: "", secondaryDriverLicense: "",
        });

        setPendingRequestId(requestId);
        setDialogOpen(true);
        router.replace("/dashboard/bookings", { scroll: false });
      } catch (err) {
        console.error("Failed to load booking request:", err);
        toast.error(t("bookingsPage.toast.failedLoad"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading]);
}
