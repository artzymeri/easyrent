"use client";

import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking } from "./types";

interface CompleteBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  bookingFull: Booking | null;
  settlementStep: "review" | "payment";
  setSettlementStep: (step: "review" | "payment") => void;
  settleMileageIn: string;
  setSettleMileageIn: (v: string) => void;
  settleExtraCharges: string;
  setSettleExtraCharges: (v: string) => void;
  settlePaymentAmount: string;
  setSettlePaymentAmount: (v: string) => void;
  saving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function CompleteBookingDialog({
  open,
  onOpenChange,
  booking,
  bookingFull,
  settlementStep,
  setSettlementStep,
  settleMileageIn,
  setSettleMileageIn,
  settleExtraCharges,
  setSettleExtraCharges,
  settlePaymentAmount,
  setSettlePaymentAmount,
  saving,
  onConfirm,
  onClose,
}: CompleteBookingDialogProps) {
  const { t } = useTranslation();
  const { fc } = useCurrency();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{settlementStep === "review" ? t("bookingsPage.completeBookingTitle") : t("payment.settlementTitle")}</DialogTitle>
          <DialogDescription>{settlementStep === "review" ? t("bookingsPage.completeBookingDescription") : t("payment.settlementDescription")}</DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="space-y-4">
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{booking.car?.make} {booking.car?.model} — {booking.customer?.firstName} {booking.customer?.lastName}</p>
              <p className="text-muted-foreground text-xs">{booking.car?.licensePlate}</p>
            </div>

            {settlementStep === "review" ? (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t("bookingsPage.preStartImages")}
                  </Label>
                  {bookingFull?.bookingImages && bookingFull.bookingImages.filter((img) => img.type === "pre_start").length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {bookingFull.bookingImages.filter((img) => img.type === "pre_start").map((img) => (
                        <div key={img.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                          {img.url.startsWith("data:video/") ? (
                            <video src={img.url} className="h-full w-full object-cover" controls muted playsInline preload="metadata" />
                          ) : (
                            <img src={img.url} alt="Pre-start" className="h-full w-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">{t("bookingsPage.noPreStartImages")}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
                  <Button onClick={() => setSettlementStep("payment")}>
                    {t("common.next")}
                  </Button>
                </div>
              </>
            ) : (
              <PaymentSettlement
                booking={booking}
                bookingFull={bookingFull}
                settleMileageIn={settleMileageIn}
                setSettleMileageIn={setSettleMileageIn}
                settleExtraCharges={settleExtraCharges}
                setSettleExtraCharges={setSettleExtraCharges}
                settlePaymentAmount={settlePaymentAmount}
                setSettlePaymentAmount={setSettlePaymentAmount}
                saving={saving}
                onConfirm={onConfirm}
                onBack={() => setSettlementStep("review")}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentSettlement({
  booking,
  bookingFull,
  settleMileageIn,
  setSettleMileageIn,
  settleExtraCharges,
  setSettleExtraCharges,
  settlePaymentAmount,
  setSettlePaymentAmount,
  saving,
  onConfirm,
  onBack,
}: {
  booking: Booking;
  bookingFull: Booking | null;
  settleMileageIn: string;
  setSettleMileageIn: (v: string) => void;
  settleExtraCharges: string;
  setSettleExtraCharges: (v: string) => void;
  settlePaymentAmount: string;
  setSettlePaymentAmount: (v: string) => void;
  saving: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { fc } = useCurrency();

  const total = parseFloat(String(bookingFull?.totalAmount ?? booking.totalAmount ?? 0));
  const alreadyPaid = parseFloat(String(bookingFull?.amountPaid ?? booking.amountPaid ?? 0));
  const extra = settleExtraCharges ? parseFloat(settleExtraCharges) : 0;
  const adjustedTotal = total + extra;
  const paymentEntered = settlePaymentAmount ? parseFloat(settlePaymentAmount) : alreadyPaid;
  const remaining = adjustedTotal - paymentEntered;

  return (
    <div className="space-y-4">
      {/* Financial summary */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("payment.totalAmount")}</span>
          <span className="font-medium">{fc(total)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("bookingsPage.amountPaid")}</span>
          <span className="font-medium">{fc(alreadyPaid)}</span>
        </div>
        {extra > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("payment.extraCharges")}</span>
            <span className="font-medium text-amber-600">+{fc(extra)}</span>
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{t("payment.remainingBalance")}</span>
          <span className={remaining > 0 ? "text-red-600" : remaining < 0 ? "text-amber-600" : "text-emerald-600"}>
            {remaining > 0 ? fc(remaining) : remaining < 0 ? `${t("payment.exceeded")} ${fc(Math.abs(remaining))}` : t("payment.fullyPaid")}
          </span>
        </div>
      </div>

      {/* Mileage in */}
      <div className="space-y-2">
        <Label>{t("payment.mileageIn")}</Label>
        <Input
          type="number"
          value={settleMileageIn}
          onChange={(e) => setSettleMileageIn(e.target.value)}
          placeholder={booking.mileageOut ? String(booking.mileageOut) : "0"}
        />
      </div>

      {/* Extra charges */}
      <div className="space-y-2">
        <Label>{t("payment.extraCharges")}</Label>
        <Input
          type="number"
          step="0.01"
          value={settleExtraCharges}
          onChange={(e) => setSettleExtraCharges(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Payment amount */}
      <div className="space-y-2">
        <Label>{t("payment.enterPayment")}</Label>
        <Input
          type="number"
          step="0.01"
          value={settlePaymentAmount}
          onChange={(e) => setSettlePaymentAmount(e.target.value)}
          placeholder={String(adjustedTotal)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          {t("common.back")}
        </Button>
        <Button onClick={onConfirm} disabled={saving}>
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          {saving ? t("common.saving") : t("bookingsPage.complete")}
        </Button>
      </div>
    </div>
  );
}
