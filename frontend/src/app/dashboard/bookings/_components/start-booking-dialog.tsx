"use client";

import { useTranslation } from "@/lib/i18n";
import { Play, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageUpload, type ImageItem } from "@/components/image-upload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking } from "./types";

interface StartBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  preStartImages: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  saving: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function StartBookingDialog({
  open,
  onOpenChange,
  booking,
  preStartImages,
  onImagesChange,
  saving,
  onConfirm,
  onClose,
}: StartBookingDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); else onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("bookingsPage.startBookingTitle")}</DialogTitle>
          <DialogDescription>{t("bookingsPage.startBookingDescription")}</DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="space-y-4">
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{booking.car?.make} {booking.car?.model} — {booking.customer?.firstName} {booking.customer?.lastName}</p>
              <p className="text-muted-foreground text-xs">{booking.car?.licensePlate}</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                {t("bookingsPage.preStartImages")}
              </Label>
              <p className="text-xs text-muted-foreground">{t("bookingsPage.preStartImagesHint")}</p>
              <ImageUpload images={preStartImages} onChange={onImagesChange} max={20} allowVideo />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
              <Button onClick={onConfirm} disabled={saving}>
                <Play className="mr-1.5 h-4 w-4" />
                {saving ? t("bookingsPage.startingBooking") : t("bookingsPage.startBooking")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
