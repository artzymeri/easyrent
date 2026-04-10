"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import type { BookingRequest } from "./types";
import { STATUS_STYLES } from "./types";

interface BookingRequestCardProps {
  req: BookingRequest;
  isActioning: boolean;
  t: (key: string) => string;
  fc: (value: number | string) => string;
  onConfirm: (req: BookingRequest) => void;
  onReject: (req: BookingRequest) => void;
  onDelete: (req: BookingRequest) => void;
}

function formatDateRange(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  const formatOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  };
  
  return `${start.toLocaleDateString(undefined, formatOpts)} – ${end.toLocaleDateString(undefined, formatOpts)}`;
}

function formatSubmittedAt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCarImage(req: BookingRequest) {
  const primary = req.car.images?.find((img) => img.isPrimary);
  return primary?.url || req.car.images?.[0]?.url || null;
}

export function BookingRequestCard({
  req,
  isActioning,
  t,
  fc,
  onConfirm,
  onReject,
  onDelete,
}: BookingRequestCardProps) {
  const carImg = getCarImage(req);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex flex-col md:flex-row">
        {/* Car image - compact */}
        <div className="relative h-48 w-full shrink-0 bg-muted md:h-auto md:w-56">
          {carImg ? (
            <img
              src={carImg}
              alt={`${req.car.make} ${req.car.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          {/* Status badge */}
          <Badge
            variant="secondary"
            className={`absolute top-3 left-3 ${STATUS_STYLES[req.status] || ""}`}
          >
            {t(`bookingRequestsPage.${req.status}`)}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Header: Car name + submitted time */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">
                {req.car.make} {req.car.model}
              </h3>
              <p className="text-sm text-muted-foreground">{req.car.licensePlate}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {t("bookingRequestsPage.submittedAt")}: {formatSubmittedAt(req.createdAt)}
            </div>
          </div>

          {/* Main info - clean layout */}
          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            {/* Customer */}
            <div>
              <p className="text-sm font-medium">
                {req.requesterFirstName} {req.requesterLastName}
              </p>
              <p className="text-xs text-muted-foreground">{req.requesterPhone}</p>
              {req.requesterEmail && (
                <p className="text-xs text-muted-foreground">{req.requesterEmail}</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <p className="text-sm font-medium">
                {formatDateRange(req.startDate, req.endDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                {req.totalDays} {req.totalDays === 1 ? t("bookingRequestsPage.day") : t("bookingRequestsPage.days")}
              </p>
            </div>

            {/* Pricing - right aligned */}
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">
                {t("bookingRequestsPage.dailyRate")}: {fc(req.dailyRate)}
              </p>
              <p className="text-xl font-bold">{fc(req.totalAmount)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
            {req.status === "pending" ? (
              <>
                <Button size="sm" onClick={() => onConfirm(req)} disabled={isActioning}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  {t("bookingRequestsPage.confirm")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(req)}
                  disabled={isActioning}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  {t("bookingRequestsPage.reject")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(req)}
                  disabled={isActioning}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  {t("bookingRequestsPage.delete")}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(req)}
                disabled={isActioning}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {t("bookingRequestsPage.delete")}
              </Button>
            )}
            {isActioning && <Spinner className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </Card>
  );
}
