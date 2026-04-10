"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  MessageSquare,
  Loader2,
  Save,
} from "lucide-react";
import type { BookingDetail, CarInfo, Company } from "./types";
import { STATUS_LABELS } from "./types";
import { QrContactCard } from "./qr-contact-card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4344/api";

interface QrBookingDetailProps {
  booking: BookingDetail;
  car: CarInfo;
  company: Company | null;
  onBack: () => void;
  onBookingUpdate: (updated: BookingDetail) => void;
}

export function QrBookingDetail({ booking, car, company, onBack, onBookingUpdate }: QrBookingDetailProps) {
  const [notes, setNotes] = useState(booking.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const formatDateTime = (d: string) => new Date(d).toLocaleString();

  const remaining = parseFloat(String(booking.totalAmount)) - parseFloat(String(booking.amountPaid || 0));

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`${API_URL}/qr/booking/${booking.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Notes saved!");
      onBookingUpdate({ ...booking, notes });
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4 space-y-4">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to bookings
      </Button>

      {/* Company header */}
      {company && (
        <div className="flex items-center gap-3">
          {company.logoUrl && (
            <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-lg object-cover" />
          )}
          <div>
            <h1 className="text-lg font-bold">{company.name}</h1>
            <p className="text-xs text-muted-foreground">{car.make} {car.model} · {car.licensePlate}</p>
          </div>
        </div>
      )}

      {/* Booking Status */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Booking #{booking.id}</CardTitle>
            <Badge
              variant={booking.status === "in_progress" ? "default" : "outline"}
            >
              {STATUS_LABELS[booking.status] || booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Start:</span>
              <span className="font-medium">{formatDateTime(booking.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">End:</span>
              <span className="font-medium">{formatDateTime(booking.endDate)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {booking.totalDays} day(s)
            </div>
          </div>

          <Separator />

          {/* Locations */}
          {(booking.pickupLocation || booking.returnLocation) && (
            <>
              <div className="space-y-1 text-sm">
                {booking.pickupLocation && (
                  <div><span className="text-muted-foreground">Pickup:</span> {booking.pickupLocation}</div>
                )}
                {booking.returnLocation && (
                  <div><span className="text-muted-foreground">Return:</span> {booking.returnLocation}</div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Financial */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Rate</span>
              <span>{booking.dailyRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{booking.subtotal}</span>
            </div>
            {parseFloat(String(booking.discount)) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{booking.discount}</span>
              </div>
            )}
            {parseFloat(String(booking.extraCharges)) > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Extra Charges</span>
                <span>+{booking.extraCharges}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{booking.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{booking.amountPaid || 0}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>Remaining</span>
                <span>{remaining.toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            Notes
          </CardTitle>
          <CardDescription>Leave notes or requests for the rental company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes here..."
            rows={4}
          />
          <Button
            size="sm"
            onClick={saveNotes}
            disabled={savingNotes || notes === (booking.notes || "")}
            className="w-full"
          >
            {savingNotes ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Notes
          </Button>
        </CardContent>
      </Card>

      {/* Contact */}
      {company && <QrContactCard company={company} />}
    </div>
  );
}
