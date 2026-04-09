"use client";

import { useState } from "react";
import { BookingModal } from "./booking-modal";
import type { Car } from "@/lib/types";

interface CarBookButtonProps {
  car: Car;
  currency: string;
  subdomain: string;
  className?: string;
  accentColor?: string;
  accentHover?: string;
  theme?: "light" | "dark";
}

export function CarBookButton({ car, currency, subdomain, className = "", accentColor = "bg-blue-600", accentHover = "hover:bg-blue-700", theme = "light" }: CarBookButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className}
      >
        Book Now
      </button>
      {showModal && (
        <BookingModal
          car={car}
          currency={currency}
          subdomain={subdomain}
          onClose={() => setShowModal(false)}
          accentColor={accentColor}
          accentHover={accentHover}
          theme={theme}
        />
      )}
    </>
  );
}
