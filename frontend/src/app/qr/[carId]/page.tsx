"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { Car, Loader2 } from "lucide-react";
import type { CarInfo, Company, BookingInfo, BookingDetail } from "./_components/types";
import { QrBookingDetail } from "./_components/qr-booking-detail";
import { QrBookingsList } from "./_components/qr-bookings-list";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4344/api";

export default function QrCarPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState<CarInfo | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`${API_URL}/qr/car/${params.carId}`);
        if (!res.ok) throw new Error("Car not found");
        const data = await res.json();
        setCar(data.car);
        setCompany(data.company);
        setBookings(data.bookings);
      } catch {
        setError("Car not found or invalid QR code");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [params.carId]);

  const selectBooking = async (bookingId: number) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/qr/booking/${bookingId}`);
      if (!res.ok) throw new Error("Booking not found");
      const data = await res.json();
      setSelectedBooking(data);
    } catch {
      toast.error("Failed to load booking details");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Not Found</h2>
            <p className="text-sm text-muted-foreground">
              {error || "This QR code is invalid or the car no longer exists."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      {selectedBooking ? (
        <QrBookingDetail
          booking={selectedBooking}
          car={car}
          company={company}
          onBack={() => setSelectedBooking(null)}
          onBookingUpdate={(updated) => setSelectedBooking(updated)}
        />
      ) : (
        <QrBookingsList
          car={car}
          company={company}
          bookings={bookings}
          onSelectBooking={selectBooking}
        />
      )}
    </div>
  );
}
