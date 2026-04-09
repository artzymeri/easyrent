"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { useSocket } from "@/lib/socket-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Inbox,
  Car as CarIcon,
  User,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface CarImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface BookingRequest {
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

type StatusFilter = "all" | "pending" | "confirmed" | "rejected";

// ── Status badge helper ───────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function BookingRequestsPage() {
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const { pendingRequestCount, refreshPendingCount } = useSocket();

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
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
  const handleConfirm = async (req: BookingRequest) => {
    setActionLoading(req.id);
    try {
      await api.post(`/booking-requests/${req.id}/confirm`, {});
      toast.success(t("bookingRequestsPage.confirmSuccess"));
      setConfirmDialogOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch {
      toast.error(t("bookingRequestsPage.error"));
    } finally {
      setActionLoading(null);
    }
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

  // ── Helpers ───────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCarImage = (req: BookingRequest) => {
    const primary = req.car.images?.find((img) => img.isPrimary);
    return primary?.url || req.car.images?.[0]?.url || null;
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
          {requests.map((req) => {
            const carImg = getCarImage(req);
            const isActioning = actionLoading === req.id;

            return (
              <Card key={req.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Car image */}
                  <div className="relative flex h-40 w-full shrink-0 items-center justify-center bg-muted sm:h-auto sm:w-48">
                    {carImg ? (
                      <img
                        src={carImg}
                        alt={`${req.car.make} ${req.car.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    )}
                    {/* Status badge overlay */}
                    <span
                      className={`absolute top-2 left-2 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[req.status] || ""}`}
                    >
                      {t(`bookingRequestsPage.${req.status}`)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    {/* Top row: car + requester */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      {/* Car info */}
                      <div className="flex items-center gap-2">
                        <CarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {req.car.make} {req.car.model}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {req.car.licensePlate}
                        </span>
                      </div>

                      {/* Submitted time */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t("bookingRequestsPage.submittedAt")}: {formatDateTime(req.createdAt)}
                      </div>
                    </div>

                    <Separator />

                    {/* Details grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Requester */}
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {req.requesterFirstName} {req.requesterLastName}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${req.requesterPhone}`} className="hover:underline">
                              {req.requesterPhone}
                            </a>
                          </div>
                          {req.requesterEmail && (
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${req.requesterEmail}`} className="hover:underline">
                                {req.requesterEmail}
                              </a>
                            </div>
                          )}
                          {!req.requesterEmail && (
                            <p className="mt-0.5 text-xs text-muted-foreground italic">
                              {t("bookingRequestsPage.noEmail")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-start gap-2">
                        <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(req.startDate)} – {formatDate(req.endDate)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {req.totalDays} {req.totalDays === 1 ? t("bookingRequestsPage.day") : t("bookingRequestsPage.days")}
                          </p>
                        </div>
                      </div>

                      {/* Daily rate */}
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("bookingRequestsPage.dailyRate")}
                        </p>
                        <p className="text-sm font-medium">{fc(req.dailyRate)}</p>
                      </div>

                      {/* Total */}
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t("bookingRequestsPage.totalAmount")}
                        </p>
                        <p className="text-lg font-bold">{fc(req.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {req.status === "pending" && (
                      <>
                        <Separator />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(req);
                              setConfirmDialogOpen(true);
                            }}
                            disabled={isActioning}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            {t("bookingRequestsPage.confirm")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req)}
                            disabled={isActioning}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            {t("bookingRequestsPage.reject")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(req)}
                            disabled={isActioning}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            {t("bookingRequestsPage.delete")}
                          </Button>
                          {isActioning && <Spinner />}
                        </div>
                      </>
                    )}

                    {/* Non-pending: show delete only */}
                    {req.status !== "pending" && (
                      <>
                        <Separator />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(req)}
                            disabled={isActioning}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            {t("bookingRequestsPage.delete")}
                          </Button>
                          {isActioning && <Spinner />}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("bookingRequestsPage.confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("bookingRequestsPage.confirmDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Summary */}
              <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingRequestsPage.car")}</span>
                  <span className="font-medium">
                    {selectedRequest.car.make} {selectedRequest.car.model} ({selectedRequest.car.licensePlate})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingRequestsPage.requester")}</span>
                  <span className="font-medium">
                    {selectedRequest.requesterFirstName} {selectedRequest.requesterLastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingRequestsPage.phone")}</span>
                  <span className="font-medium">{selectedRequest.requesterPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingRequestsPage.dates")}</span>
                  <span className="font-medium">
                    {formatDate(selectedRequest.startDate)} – {formatDate(selectedRequest.endDate)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("bookingRequestsPage.totalAmount")}</span>
                  <span className="text-lg font-bold">{fc(selectedRequest.totalAmount)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmDialogOpen(false);
                    setSelectedRequest(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={() => handleConfirm(selectedRequest)}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <Spinner />
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      {t("bookingRequestsPage.confirm")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
