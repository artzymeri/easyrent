"use client";

import { useTranslation } from "@/lib/i18n";
import { Play, CheckCircle2, XCircle, Download, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { Booking } from "./types";
import { BookingDetailContent } from "./booking-detail-content";

interface BookingDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  generatingReport: boolean;
  sendingEmail: boolean;
  onDownloadReport: (id: number) => void;
  onSendEmail: (b: Booking) => void;
  onDeleteBooking: (id: number) => void;
  onStartBooking: (b: Booking) => void;
  onCompleteBooking: (b: Booking) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export function BookingDetailSheet({
  open,
  onOpenChange,
  booking,
  generatingReport,
  sendingEmail,
  onDownloadReport,
  onSendEmail,
  onDeleteBooking,
  onStartBooking,
  onCompleteBooking,
  onUpdateStatus,
}: BookingDetailSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        {booking && (() => {
          const b = booking;
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

              <BookingDetailContent booking={b} />

              {/* Action Buttons — sticky footer */}
              <div className="flex flex-col gap-2 border-t px-4 py-3">
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={generatingReport}
                  onClick={() => onDownloadReport(b.id)}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  {generatingReport ? t("report.generating") : t("report.generateReport")}
                </Button>
                {b.customer?.email && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={sendingEmail}
                    onClick={() => onSendEmail(b)}
                  >
                    <Mail className="mr-1.5 h-4 w-4" />
                    {sendingEmail ? t("email.sending") : t("email.sendToClient")}
                  </Button>
                )}
                {b.status === "cancelled" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => onDeleteBooking(b.id)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    {t("common.delete")}
                  </Button>
                )}
                {b.status !== "completed" && b.status !== "cancelled" && (
                  <div className="flex gap-2">
                    {b.status === "pending_start" && (
                      <Button className="flex-1" onClick={() => onStartBooking(b)}>
                        <Play className="mr-1.5 h-4 w-4" />
                        {t("bookingsPage.start")}
                      </Button>
                    )}
                    {b.status === "in_progress" && (
                      <Button className="flex-1" onClick={() => onCompleteBooking(b)}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {t("bookingsPage.complete")}
                      </Button>
                    )}
                    {(b.status === "pending_start" || b.status === "in_progress") && (
                      <Button variant="outline" className="flex-1" onClick={() => { onUpdateStatus(b.id, "cancelled"); onOpenChange(false); }}>
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
  );
}
