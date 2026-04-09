"use client";

import { useState, useEffect, useMemo } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { eachDayOfInterval, isWithinInterval, parseISO, format, isBefore, startOfDay } from "date-fns";
import { getBookedDates, submitBookingRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { Car } from "@/lib/types";
import { X, Loader2, CheckCircle, Calendar, User, Phone, Mail } from "lucide-react";

interface BookingModalProps {
  car: Car;
  currency: string;
  subdomain: string;
  onClose: () => void;
  accentColor?: string;
  accentHover?: string;
  theme?: "light" | "dark";
}

export function BookingModal({ car, currency, subdomain, onClose, accentColor = "bg-blue-600", accentHover = "hover:bg-blue-700", theme = "light" }: BookingModalProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [dailyRate, setDailyRate] = useState(Number(car.dailyRate));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-500";
  const bgColor = isDark ? "bg-zinc-900" : "bg-white";
  const borderColor = isDark ? "border-zinc-700" : "border-gray-200";
  const inputBg = isDark ? "bg-zinc-800 text-white border-zinc-700 placeholder:text-zinc-500" : "bg-white text-gray-900 border-gray-300 placeholder:text-gray-400";

  useEffect(() => {
    getBookedDates(subdomain, car.id).then((data) => {
      setDailyRate(Number(data.dailyRate) || Number(car.dailyRate));
      const dates: Date[] = [];
      for (const range of data.bookedRanges) {
        const start = parseISO(range.start);
        const end = parseISO(range.end);
        const days = eachDayOfInterval({ start, end });
        dates.push(...days);
      }
      setBookedDates(dates);
      setLoading(false);
    });
  }, [subdomain, car.id, car.dailyRate]);

  const totalDays = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)));
  }, [range]);

  const totalAmount = totalDays * dailyRate;

  // Check if selected range overlaps with booked dates
  const hasOverlap = useMemo(() => {
    if (!range?.from || !range?.to) return false;
    return bookedDates.some((d) =>
      isWithinInterval(d, { start: range.from!, end: range.to! })
    );
  }, [range, bookedDates]);

  const isDisabledDay = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    return bookedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const handleSubmit = async () => {
    if (!range?.from || !range?.to || !firstName || !lastName || !phone) return;
    if (hasOverlap) return;

    setSubmitting(true);
    setError("");

    const result = await submitBookingRequest(subdomain, {
      carId: car.id,
      startDate: format(range.from, "yyyy-MM-dd"),
      endDate: format(range.to, "yyyy-MM-dd"),
      firstName,
      lastName,
      email: email || undefined,
      phone,
    });

    setSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  const canSubmit = range?.from && range?.to && firstName && lastName && phone && !hasOverlap && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl ${bgColor} p-6 shadow-2xl border ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 rounded-full p-1.5 ${isDark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-100 text-gray-400"} transition-colors`}
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-12 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isDark ? "bg-green-900/30" : "bg-green-50"}`}>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className={`text-xl font-bold ${textColor}`}>Request Submitted!</h3>
            <p className={`mt-2 ${subtextColor}`}>
              Your booking request for <strong>{car.make} {car.model}</strong> has been sent.
              The team will review it and contact you shortly.
            </p>
            <button
              onClick={onClose}
              className={`mt-6 rounded-xl ${accentColor} px-6 py-2.5 text-sm font-semibold text-white ${accentHover} transition-colors`}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5">
              <h3 className={`text-xl font-bold ${textColor}`}>Book {car.make} {car.model}</h3>
              <p className={`mt-1 text-sm ${subtextColor}`}>
                {formatCurrency(dailyRate, currency)}/day • Select your dates below
              </p>
            </div>

            {/* Calendar */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={`h-6 w-6 animate-spin ${subtextColor}`} />
              </div>
            ) : (
              <>
                <div className={`rounded-xl border ${borderColor} p-3 mb-4`}>
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={isDisabledDay}
                    modifiers={{
                      booked: bookedDates,
                    }}
                    modifiersClassNames={{
                      booked: "rdp-booked",
                    }}
                    numberOfMonths={1}
                    fromDate={new Date()}
                    classNames={{
                      root: `w-full ${isDark ? "rdp-dark" : ""}`,
                      month_caption: `text-sm font-semibold ${textColor} mb-2`,
                      nav: "flex gap-1",
                      button_previous: `p-1.5 rounded-lg ${isDark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`,
                      button_next: `p-1.5 rounded-lg ${isDark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"}`,
                      weekday: `text-xs font-medium ${subtextColor} w-10 h-8`,
                      day: `w-10 h-10 text-sm ${textColor}`,
                      day_button: "w-full h-full rounded-full transition-colors",
                      selected: `!rounded-full`,
                      range_start: "rdp-range-start-day",
                      range_end: "rdp-range-end-day",
                      range_middle: "rdp-range-middle-day",
                      disabled: `!text-gray-300 ${isDark ? "!text-zinc-600" : ""} line-through pointer-events-none`,
                      today: `font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`,
                    }}
                  />
                </div>

                {/* Date summary */}
                {range?.from && range?.to && (
                  <div className={`rounded-xl border ${borderColor} p-4 mb-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`h-4 w-4 ${subtextColor}`} />
                        <span className={`text-sm ${textColor}`}>
                          {format(range.from, "MMM d")} — {format(range.to, "MMM d, yyyy")}
                        </span>
                      </div>
                      <span className={`text-sm ${subtextColor}`}>{totalDays} {totalDays === 1 ? "day" : "days"}</span>
                    </div>
                    <div className={`mt-2 flex items-center justify-between border-t pt-2 ${borderColor}`}>
                      <span className={`text-sm font-medium ${textColor}`}>Total</span>
                      <span className={`text-lg font-bold ${textColor}`}>{formatCurrency(totalAmount, currency)}</span>
                    </div>
                    {hasOverlap && (
                      <p className="mt-2 text-sm text-red-500">Selected dates overlap with existing bookings. Please choose different dates.</p>
                    )}
                  </div>
                )}

                {/* Contact form */}
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>
                        First Name *
                      </label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className={`w-full rounded-lg border py-2.5 px-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+383 44 123 456"
                        className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>
                      Email <span className={subtextColor}>(optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
                )}

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`w-full rounded-xl ${accentColor} px-4 py-3 text-sm font-semibold text-white ${accentHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Booking"
                  )}
                </button>

                <p className={`mt-3 text-center text-xs ${subtextColor}`}>
                  This is a booking request. The rental company will review and confirm your reservation.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
