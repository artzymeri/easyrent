"use client";

import { useTranslation } from "@/lib/i18n";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import type { BookingForm, Car, Customer, DeliveryPoint, PendingRequestInfo } from "./types";
import { NewBookingFormFields } from "./new-booking-form-fields";

interface NewBookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: BookingForm;
  setForm: (form: BookingForm) => void;
  cars: Car[];
  customers: Customer[];
  deliveryPoints: DeliveryPoint[];
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  pendingRequestId: number | null;
  pendingRequestInfo: PendingRequestInfo | null;
  onRequestInfoOpen: () => void;
  pickupCustom: boolean;
  setPickupCustom: (v: boolean) => void;
  returnCustom: boolean;
  setReturnCustom: (v: boolean) => void;
  onQuickCustomerOpen: () => void;
}

export function NewBookingSheet({
  open,
  onOpenChange,
  form,
  setForm,
  cars,
  customers,
  deliveryPoints,
  saving,
  onSubmit,
  onClose,
  pendingRequestId,
  pendingRequestInfo,
  onRequestInfoOpen,
  pickupCustom,
  setPickupCustom,
  returnCustom,
  setReturnCustom,
  onQuickCustomerOpen,
}: NewBookingSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <SheetTitle>
              {pendingRequestId
                ? t("bookingsPage.confirmRequestTitle")
                : t("bookingsPage.dialogTitle")}
            </SheetTitle>
            {pendingRequestInfo && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-full"
                onClick={onRequestInfoOpen}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
          <SheetDescription>
            {pendingRequestId
              ? t("bookingsPage.confirmRequestDescription")
              : t("bookingsPage.dialogDescription")}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <NewBookingFormFields
            form={form}
            setForm={setForm}
            cars={cars}
            customers={customers}
            deliveryPoints={deliveryPoints}
            pickupCustom={pickupCustom}
            setPickupCustom={setPickupCustom}
            returnCustom={returnCustom}
            setReturnCustom={setReturnCustom}
            onQuickCustomerOpen={onQuickCustomerOpen}
          />
          <SheetFooter className="border-t">
            <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? t("bookingsPage.creating")
                : pendingRequestId
                  ? t("bookingsPage.confirmAndCreate")
                  : t("bookingsPage.createBooking")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
