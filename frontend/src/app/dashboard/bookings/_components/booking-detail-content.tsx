"use client";

import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Car as CarIcon, User, MapPin, Clock, CreditCard, FileText, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Booking } from "./types";

interface BookingDetailContentProps {
  booking: Booking;
}

export function BookingDetailContent({ booking: b }: BookingDetailContentProps) {
  const { t } = useTranslation();
  const { fc } = useCurrency();

  const startDate = new Date(b.startDate);
  const endDate = new Date(b.endDate);
  const formatDate = (d: Date) => d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const formatTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

  return (
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
  );
}
