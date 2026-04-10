"use client";

import { useState, useEffect, useMemo } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { eachDayOfInterval, isWithinInterval, parseISO, format, isBefore, startOfDay } from "date-fns";
import { getBookedDates, submitBookingRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { Car } from "@/lib/types";
import { X, Loader2 } from "lucide-react";
import { BookingSuccess } from "./booking-success";
import { BookingContactForm } from "./booking-contact-form";
import { BookingDateSummary } from "./booking-date-summary";

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
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");

  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-500";
  const bgColor = isDark ? "bg-zinc-900" : "bg-white";
  const borderColor = isDark ? "border-zinc-700" : "border-gray-200";
  const inputBg = isDark ? "bg-zinc-800 text-white border-zinc-700 placeholder:text-zinc-500" : "bg-white text-gray-900 border-gray-300 placeholder:text-gray-400";

  useEffect(() => {
    getBookedDates(subdomain, car.id)
      .then((data) => {
        setDailyRate(Number(data.dailyRate) || Number(car.dailyRate));
        const dates: Date[] = [];
        for (const r of data.bookedRanges) {
          const start = parseISO(r.start);
          const end = parseISO(r.end);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
          dates.push(...eachDayOfInterval({ start, end }));
        }
        setBookedDates(dates);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [subdomain, car.id, car.dailyRate]);

  const totalDays = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(1, Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)));
  }, [range]);

  const totalAmount = totalDays * dailyRate;

  const hasOverlap = useMemo(() => {
    if (!range?.from || !range?.to) return false;
    return bookedDates.some((d) => isWithinInterval(d, { start: range.from!, end: range.to! }));
  }, [range, bookedDates]);

  const isDisabledDay = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    return bookedDates.some((d) => d.toDateString() === date.toDateString());
  };

  const handleSubmit = async () => {
    if (!range?.from || !range?.to || !firstName || !lastName || !phone || hasOverlap) return;
    setSubmitting(true);
    setError("");
    const result = await submitBookingRequest(subdomain, {
      carId: car.id, startDate: `${format(range.from, "yyyy-MM-dd")}T${pickupTime}`,
      endDate: `${format(range.to, "yyyy-MM-dd")}T${returnTime}`, firstName, lastName,
      email: email || undefined, phone,
    });
    setSubmitting(false);
    if (result.success) setSuccess(true);
    else setError(result.error || "Something went wrong");
  };

  const canSubmit = range?.from && range?.to && firstName && lastName && phone && !hasOverlap && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl ${bgColor} p-6 shadow-2xl border ${borderColor}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={`absolute right-4 top-4 rounded-full p-1.5 ${isDark ? "hover:bg-zinc-800 text-gray-400" : "hover:bg-gray-100 text-gray-400"} transition-colors`}>
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <BookingSuccess car={car} accentColor={accentColor} accentHover={accentHover} textColor={textColor} subtextColor={subtextColor} isDark={isDark} onClose={onClose} />
        ) : (
          <>
            <div className="mb-5">
              <h3 className={`text-xl font-bold ${textColor}`}>Book {car.make} {car.model}</h3>
              <p className={`mt-1 text-sm ${subtextColor}`}>{formatCurrency(dailyRate, currency)}/day • Select your dates below</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={`h-6 w-6 animate-spin ${subtextColor}`} />
              </div>
            ) : (
              <>
                <div className={`rounded-xl border ${borderColor} p-3 mb-4 ${isDark ? "rdp-dark" : "rdp-light"}`}>
                  <DayPicker mode="range" selected={range} onSelect={setRange} disabled={isDisabledDay} excludeDisabled modifiers={{ booked: bookedDates }} modifiersClassNames={{ booked: "rdp-booked" }} numberOfMonths={1} fromDate={new Date()} />
                </div>

                {range?.from && range?.to && (
                  <BookingDateSummary
                    range={range as { from: Date; to: Date }}
                    pickupTime={pickupTime} returnTime={returnTime}
                    totalDays={totalDays} totalAmount={totalAmount} currency={currency}
                    hasOverlap={hasOverlap} borderColor={borderColor} textColor={textColor}
                    subtextColor={subtextColor} inputBg={inputBg}
                    onPickupTimeChange={setPickupTime} onReturnTimeChange={setReturnTime}
                  />
                )}

                <BookingContactForm
                  firstName={firstName} lastName={lastName} email={email} phone={phone}
                  onFirstNameChange={setFirstName} onLastNameChange={setLastName}
                  onEmailChange={setEmail} onPhoneChange={setPhone}
                  subtextColor={subtextColor} inputBg={inputBg}
                />

                {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

                <button onClick={handleSubmit} disabled={!canSubmit} className={`w-full rounded-xl ${accentColor} px-4 py-3 text-sm font-semibold text-white ${accentHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
                  {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>) : "Request Booking"}
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
