"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { toast, Toaster } from "sonner";
import {
  Car,
  CalendarDays,
  Clock,
  Phone,
  Mail,
  User,
  Building2,
  ChevronLeft,
  MessageSquare,
  Loader2,
  Save,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4344/api";

interface Company {
  id: number;
  name: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  currency: string;
}

interface CarInfo {
  id: number;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  year: number;
}

interface BookingCustomer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

interface BookingInfo {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  notes: string | null;
  customer: BookingCustomer | null;
}

interface BookingDetail {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  discount: number;
  extraCharges: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  pickupLocation: string;
  returnLocation: string;
  notes: string | null;
  car: CarInfo;
  customer: BookingCustomer;
  company: Company;
}

const STATUS_LABELS: Record<string, string> = {
  pending_start: "Pending Start",
  in_progress: "In Progress",
  pending_return: "Pending Return",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function QrCarPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState<CarInfo | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
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
      setNotes(data.notes || "");
    } catch {
      toast.error("Failed to load booking details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedBooking) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`${API_URL}/qr/booking/${selectedBooking.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Notes saved!");
      setSelectedBooking({ ...selectedBooking, notes });
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString();
  const formatDateTime = (d: string) => new Date(d).toLocaleString();

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

  // Booking detail view
  if (selectedBooking) {
    const remaining = parseFloat(String(selectedBooking.totalAmount)) - parseFloat(String(selectedBooking.amountPaid || 0));

    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        <div className="mx-auto max-w-lg p-4 space-y-4">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedBooking(null)}
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
                <CardTitle className="text-base">Booking #{selectedBooking.id}</CardTitle>
                <Badge
                  variant={selectedBooking.status === "in_progress" ? "default" : "outline"}
                >
                  {STATUS_LABELS[selectedBooking.status] || selectedBooking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Start:</span>
                  <span className="font-medium">{formatDateTime(selectedBooking.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">End:</span>
                  <span className="font-medium">{formatDateTime(selectedBooking.endDate)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedBooking.totalDays} day(s)
                </div>
              </div>

              <Separator />

              {/* Locations */}
              {(selectedBooking.pickupLocation || selectedBooking.returnLocation) && (
                <>
                  <div className="space-y-1 text-sm">
                    {selectedBooking.pickupLocation && (
                      <div><span className="text-muted-foreground">Pickup:</span> {selectedBooking.pickupLocation}</div>
                    )}
                    {selectedBooking.returnLocation && (
                      <div><span className="text-muted-foreground">Return:</span> {selectedBooking.returnLocation}</div>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {/* Financial */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <span>{selectedBooking.dailyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{selectedBooking.subtotal}</span>
                </div>
                {parseFloat(String(selectedBooking.discount)) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{selectedBooking.discount}</span>
                  </div>
                )}
                {parseFloat(String(selectedBooking.extraCharges)) > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Extra Charges</span>
                    <span>+{selectedBooking.extraCharges}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{selectedBooking.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span>{selectedBooking.amountPaid || 0}</span>
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
                disabled={savingNotes || notes === (selectedBooking.notes || "")}
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
          {company && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2">Contact</h3>
                <div className="space-y-1.5 text-sm">
                  {company.phone && (
                    <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-blue-600">
                      <Phone className="h-3.5 w-3.5" />
                      {company.phone}
                    </a>
                  )}
                  {company.email && (
                    <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-blue-600">
                      <Mail className="h-3.5 w-3.5" />
                      {company.email}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Bookings list view
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
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
                    onClick={() => selectBooking(b.id)}
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
        {company && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Contact {company.name}</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-blue-600">
                    <Phone className="h-3.5 w-3.5" />
                    {company.phone}
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-blue-600">
                    <Mail className="h-3.5 w-3.5" />
                    {company.email}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
