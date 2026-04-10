"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, CalendarDays, User } from "lucide-react";
import type { BookingInfo, CarInfo, Company } from "./types";
import { STATUS_LABELS } from "./types";
import { QrContactCard } from "./qr-contact-card";

interface QrBookingsListProps {
  car: CarInfo;
  company: Company | null;
  bookings: BookingInfo[];
  onSelectBooking: (bookingId: number) => void;
}

export function QrBookingsList({ car, company, bookings, onSelectBooking }: QrBookingsListProps) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString();

  return (
    <div className="mx-auto max-w-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {company?.logoUrl && (
          <img src={company.logoUrl} alt={company.name} className="h-12 w-12 rounded-lg object-cover" />
        )}
        <div>
          <h1 className="text-xl font-bold">{company?.name || "EasyRent"}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4" />
            {car.year} {car.make} {car.model} · {car.licensePlate}
          </div>
        </div>
      </div>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Bookings</CardTitle>
          <CardDescription>
            {bookings.length === 0
              ? "No active bookings for this car"
              : `${bookings.length} active booking(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <CalendarDays className="h-10 w-10 opacity-40" />
              <p className="text-sm">No active bookings found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelectBooking(b.id)}
                  className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {b.customer?.firstName} {b.customer?.lastName}
                      </span>
                    </div>
                    <Badge
                      variant={b.status === "in_progress" ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {STATUS_LABELS[b.status] || b.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(b.startDate)} → {formatDate(b.endDate)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact info */}
      {company && <QrContactCard company={company} showLabel />}
    </div>
  );
}
