"use client";

import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Play, CheckCircle2, XCircle, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, Eye } from "@/components/data-table";
import type { Booking } from "./types";

interface BookingListViewProps {
  bookings: Booking[];
  hasActiveFilters: boolean;
  onSelectBooking: (b: Booking) => void;
  onDownloadReport: (id: number) => void;
  onStartBooking: (b: Booking) => void;
  onCompleteBooking: (b: Booking) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onDeleteBooking: (id: number) => void;
}

export function BookingListView({
  bookings,
  hasActiveFilters,
  onSelectBooking,
  onDownloadReport,
  onStartBooking,
  onCompleteBooking,
  onUpdateStatus,
  onDeleteBooking,
}: BookingListViewProps) {
  const { t } = useTranslation();
  const { fc } = useCurrency();

  return (
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
      onRowClick={(b) => onSelectBooking(b)}
      actions={[
        {
          label: t("common.view"),
          icon: <Eye className="h-4 w-4" />,
          onClick: (b) => onSelectBooking(b),
        },
        {
          label: t("bookingsPage.downloadReport"),
          icon: <Download className="h-4 w-4" />,
          onClick: (b) => onDownloadReport(b.id),
        },
        {
          label: t("bookingsPage.start"),
          icon: <Play className="h-4 w-4" />,
          onClick: (b) => onStartBooking(b),
          hidden: (b) => b.status !== "pending_start",
        },
        {
          label: t("bookingsPage.complete"),
          icon: <CheckCircle2 className="h-4 w-4" />,
          onClick: (b) => onCompleteBooking(b),
          hidden: (b) => b.status !== "in_progress",
        },
        {
          label: t("common.cancel"),
          icon: <XCircle className="h-4 w-4" />,
          onClick: (b) => onUpdateStatus(b.id, "cancelled"),
          variant: "destructive",
          hidden: (b) => b.status !== "pending_start" && b.status !== "in_progress",
        },
        {
          label: t("common.delete"),
          icon: <Trash2 className="h-4 w-4" />,
          onClick: (b) => onDeleteBooking(b.id),
          variant: "destructive",
          hidden: (b) => b.status !== "cancelled",
        },
      ]}
      emptyMessage={hasActiveFilters ? t("bookingsPage.noBookingsFilter") : t("bookingsPage.emptyState")}
      defaultSortKey="dates"
      defaultSortDir="desc"
    />
  );
}
