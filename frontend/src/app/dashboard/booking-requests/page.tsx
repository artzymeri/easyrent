"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { useSocket } from "@/lib/socket-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import type { BookingRequest, StatusFilter } from "./_components/types";
import { BookingRequestCard } from "./_components/booking-request-card";

export default function BookingRequestsPage() {
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const { pendingRequestCount } = useSocket();
  const router = useRouter();

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchRequests = async () => {
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const data = await api.get<{ rows: BookingRequest[]; count: number }>(
        `/booking-requests${params}`
      );
      setRequests(data.rows || []);
    } catch {
      toast.error(t("bookingRequestsPage.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Re-fetch when socket signals a change
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRequestCount]);

  // ── Actions ───────────────────────────────────────────────
  const handleConfirm = (req: BookingRequest) => {
    router.push(`/dashboard/bookings?fromRequest=${req.id}`);
  };

  const handleReject = async (req: BookingRequest) => {
    setActionLoading(req.id);
    try {
      await api.post(`/booking-requests/${req.id}/reject`, {});
      toast.success(t("bookingRequestsPage.rejectSuccess"));
      fetchRequests();
    } catch {
      toast.error(t("bookingRequestsPage.error"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (req: BookingRequest) => {
    setActionLoading(req.id);
    try {
      await api.delete(`/booking-requests/${req.id}`);
      toast.success(t("bookingRequestsPage.deleteSuccess"));
      fetchRequests();
    } catch {
      toast.error(t("bookingRequestsPage.error"));
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter tabs ───────────────────────────────────────────
  const filters: { key: StatusFilter; labelKey: string }[] = [
    { key: "all", labelKey: "bookingRequestsPage.filterAll" },
    { key: "pending", labelKey: "bookingRequestsPage.filterPending" },
    { key: "confirmed", labelKey: "bookingRequestsPage.filterConfirmed" },
    { key: "rejected", labelKey: "bookingRequestsPage.filterRejected" },
  ];

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  // ── Loading state ─────────────────────────────────────────
  if (loading && requests.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("bookingRequestsPage.title")}
          {pendingCount > 0 && filter === "all" && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-sm font-medium text-yellow-800">
              {pendingCount}
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("bookingRequestsPage.description")}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
          >
            {t(f.labelKey)}
          </Button>
        ))}
      </div>

      {/* Loading overlay for filter changes */}
      {loading && requests.length > 0 && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Empty state */}
      {!loading && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">{t("bookingRequestsPage.noRequests")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("bookingRequestsPage.noRequestsDesc")}
          </p>
        </div>
      )}

      {/* Request cards */}
      {!loading && requests.length > 0 && (
        <div className="grid gap-4">
          {requests.map((req) => (
            <BookingRequestCard
              key={req.id}
              req={req}
              isActioning={actionLoading === req.id}
              t={t}
              fc={fc}
              onConfirm={handleConfirm}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
