"use client";

import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { User, Phone, Mail, Car as CarIcon, Clock, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PendingRequestInfo } from "./types";

interface RequestInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  info: PendingRequestInfo | null;
}

export function RequestInfoDialog({ open, onOpenChange, info }: RequestInfoDialogProps) {
  const { t } = useTranslation();
  const { fc } = useCurrency();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("bookingsPage.requestInfoTitle")}</DialogTitle>
          <DialogDescription>{t("bookingsPage.requestInfoDescription")}</DialogDescription>
        </DialogHeader>
        {info && (
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-muted p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {info.requesterFirstName} {info.requesterLastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{info.requesterPhone}</span>
              </div>
              {info.requesterEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{info.requesterEmail}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <CarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{info.carName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {info.startDate.replace("T", " ")} — {info.endDate.replace("T", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{info.totalDays} {t("bookingsPage.sheetDays")}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("bookingsPage.dailyRate")}</span>
                <span className="font-medium">{fc(info.dailyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("bookingsPage.sheetTotal")}</span>
                <span className="text-lg font-bold">{fc(info.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
