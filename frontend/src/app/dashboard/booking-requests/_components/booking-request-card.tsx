"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const datePart = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  if (hours === 0 && minutes === 0) return datePart;
  const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${datePart} ${timePart}`;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
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
    <Card className="overflow-hidden">
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
                  onClick={() => onConfirm(req)}
                  disabled={isActioning}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  {t("bookingRequestsPage.confirm")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(req)}
                  disabled={isActioning}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  {t("bookingRequestsPage.reject")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(req)}
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
                  onClick={() => onDelete(req)}
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
}
