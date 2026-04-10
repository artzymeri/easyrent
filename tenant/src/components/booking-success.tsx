"use client";

import { CheckCircle } from "lucide-react";
import type { Car } from "@/lib/types";

interface BookingSuccessProps {
  car: Car;
  accentColor: string;
  accentHover: string;
  textColor: string;
  subtextColor: string;
  isDark: boolean;
  onClose: () => void;
}

export function BookingSuccess({
  car,
  accentColor,
  accentHover,
  textColor,
  subtextColor,
  isDark,
  onClose,
}: BookingSuccessProps) {
  return (
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
  );
}
