"use client";

import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { formatCurrency } from "@/lib/currency";
import { Calendar, Clock } from "lucide-react";

interface BookingDateSummaryProps {
  range: DateRange;
  pickupTime: string;
  returnTime: string;
  totalDays: number;
  totalAmount: number;
  currency: string;
  hasOverlap: boolean;
  borderColor: string;
  textColor: string;
  subtextColor: string;
  inputBg: string;
  onPickupTimeChange: (v: string) => void;
  onReturnTimeChange: (v: string) => void;
}

export function BookingDateSummary({
  range,
  pickupTime,
  returnTime,
  totalDays,
  totalAmount,
  currency,
  hasOverlap,
  borderColor,
  textColor,
  subtextColor,
  inputBg,
  onPickupTimeChange,
  onReturnTimeChange,
}: BookingDateSummaryProps) {
  return (
    <>
      {/* Time selection */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>Pickup Time</label>
          <div className="relative">
            <Clock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => onPickupTimeChange(e.target.value)}
              className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
        <div>
          <label className={`mb-1 block text-xs font-medium ${subtextColor}`}>Return Time</label>
          <div className="relative">
            <Clock className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${subtextColor}`} />
            <input
              type="time"
              value={returnTime}
              onChange={(e) => onReturnTimeChange(e.target.value)}
              className={`w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
      </div>

      {/* Date summary */}
      <div className={`rounded-xl border ${borderColor} p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${subtextColor}`} />
            <span className={`text-sm ${textColor}`}>
              {format(range.from!, "MMM d")} {pickupTime} — {format(range.to!, "MMM d, yyyy")} {returnTime}
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
    </>
  );
}
