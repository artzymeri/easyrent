"use client";

import { useTranslation } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "./types";
import { getDaysInMonth, getFirstDayOfMonth, MONTH_KEYS, DAY_KEYS, BOOKING_COLORS } from "./types";

type CalDay = { day: number; month: number; year: number; isCurrentMonth: boolean };

interface BookingCalendarProps {
  bookings: Booking[];
  calYear: number;
  calMonth: number;
  setCalYear: (y: number) => void;
  setCalMonth: (m: number) => void;
  onSelectBooking: (b: Booking) => void;
}

export function BookingCalendar({ bookings, calYear, calMonth, setCalYear, setCalMonth, onSelectBooking }: BookingCalendarProps) {
  const { t } = useTranslation();

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
  const prevYear = calMonth === 0 ? calYear - 1 : calYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const calDays: CalDay[] = [];

  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    calDays.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    calDays.push({ day: d, month: calMonth, year: calYear, isCurrentMonth: true });
  }
  // Next month overflow
  const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
  const nextYear = calMonth === 11 ? calYear + 1 : calYear;
  const remaining = 7 - (calDays.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      calDays.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }
  }
  // Ensure at least 6 rows
  while (calDays.length < 42) {
    const last = calDays[calDays.length - 1];
    const nd = last.day + 1;
    const nm = nd > getDaysInMonth(last.year, last.month) ? (last.month + 1) % 12 : last.month;
    const ny = nd > getDaysInMonth(last.year, last.month) && last.month === 11 ? last.year + 1 : last.year;
    calDays.push({ day: nm !== last.month ? 1 : nd, month: nm, year: ny, isCurrentMonth: false });
  }

  const weeks: CalDay[][] = [];
  for (let i = 0; i < calDays.length; i += 7) {
    weeks.push(calDays.slice(i, i + 7));
  }

  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  const bookingColorMap = new Map<number, typeof BOOKING_COLORS[0]>();
  activeBookings.forEach((b, i) => {
    bookingColorMap.set(b.id, BOOKING_COLORS[i % BOOKING_COLORS.length]);
  });

  const getBookingsForDate = (d: CalDay) => {
    const date = new Date(d.year, d.month, d.day);
    date.setHours(0, 0, 0, 0);
    return activeBookings.filter((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  const isBookingStart = (b: Booking, d: CalDay) => {
    const start = new Date(b.startDate);
    return start.getFullYear() === d.year && start.getMonth() === d.month && start.getDate() === d.day;
  };

  const isDayStartOfWeek = (_d: CalDay, dayIndex: number) => dayIndex === 0;

  const getSpanInWeek = (b: Booking, d: CalDay, dayIndex: number) => {
    const end = new Date(b.endDate);
    end.setHours(23, 59, 59, 999);
    const remainingInWeek = 7 - dayIndex;
    let span = 0;
    for (let i = 0; i < remainingInWeek; i++) {
      const checkDate = new Date(d.year, d.month, d.day + i);
      checkDate.setHours(0, 0, 0, 0);
      if (checkDate <= end) span++;
      else break;
    }
    return span;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
          if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
          else setCalMonth(calMonth - 1);
        }}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{t(MONTH_KEYS[calMonth])} {calYear}</h2>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
          if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
          else setCalMonth(calMonth + 1);
        }}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day header row */}
      <div className="grid grid-cols-7 border-b">
        {DAY_KEYS.map((dk) => (
          <div key={dk} className="border-r last:border-r-0 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t(dk)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const dayBookings = getBookingsForDate(d);
            const isToday = d.year === today.getFullYear() && d.month === today.getMonth() && d.day === today.getDate();

            return (
              <div
                key={`${wi}-${di}`}
                className={`relative min-h-[120px] border-b border-r p-1.5 transition-colors ${
                  di === 6 ? "border-r-0" : ""
                } ${wi === weeks.length - 1 ? "border-b-0" : ""} ${
                  !d.isCurrentMonth ? "bg-muted/30" : "bg-card"
                } ${dayBookings.length > 0 ? "cursor-pointer hover:bg-accent/50" : ""}`}
                onClick={() => {
                  if (dayBookings.length === 1) {
                    onSelectBooking(dayBookings[0]);
                  }
                }}
              >
                {/* Day number */}
                <div className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  isToday
                    ? "bg-primary font-bold text-primary-foreground"
                    : d.isCurrentMonth
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/50"
                }`}>
                  {d.day}
                </div>

                {/* Booking events */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((b) => {
                    const color = bookingColorMap.get(b.id) || BOOKING_COLORS[0];
                    const startsHere = isBookingStart(b, d);
                    const isWeekStart = isDayStartOfWeek(d, di);

                    if (startsHere || isWeekStart) {
                      const span = getSpanInWeek(b, d, di);
                      const label = startsHere
                        ? `${b.car?.make} ${b.car?.model} — ${b.customer?.firstName} ${b.customer?.lastName}`
                        : `${b.car?.make} ${b.car?.model}`;
                      const isCompleted = b.status === "completed";

                      return (
                        <div
                          key={b.id}
                          className={`${isCompleted ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400" : `${color.bg} ${color.text}`} relative z-10 cursor-pointer truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 shadow-sm transition-opacity hover:opacity-80 ${isCompleted ? "opacity-50" : ""}`}
                          style={{
                            width: `calc(${span * 100}% + ${(span - 1) * 1}px)`,
                          }}
                          title={`${b.car?.make} ${b.car?.model} — ${b.customer?.firstName} ${b.customer?.lastName} (${new Date(b.startDate).toLocaleDateString(undefined, { timeZone: "UTC" })} → ${new Date(b.endDate).toLocaleDateString(undefined, { timeZone: "UTC" })})`}
                          onClick={(e) => { e.stopPropagation(); onSelectBooking(b); }}
                        >
                          {label}
                        </div>
                      );
                    }

                    return null;
                  })}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {t("common.more", { count: String(dayBookings.length - 3) })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
