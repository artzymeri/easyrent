import { formatCurrency } from "@/lib/currency";
import { Fuel, Users, Gauge } from "lucide-react";
import { CarBookButton } from "@/components/car-book-button";
import type { Car } from "@/lib/types";

interface CarsGridProps {
  cars: Car[];
  currency: string;
  subdomain: string;
  accentColor?: string;
  accentHover?: string;
  theme?: "light" | "dark";
  cardStyle?: "rounded" | "sharp" | "minimal";
}

export function CarsGrid({
  cars, currency, subdomain,
  accentColor = "bg-blue-600",
  accentHover = "hover:bg-blue-700",
  theme = "light",
  cardStyle = "rounded",
}: CarsGridProps) {
  const isDark = theme === "dark";

  if (cars.length === 0) {
    return (
      <p className={`text-center py-12 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        No cars available at the moment.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => {
        const primaryImage = car.images?.find((i) => i.isPrimary) || car.images?.[0];
        return (
          <div
            key={car.id}
            className={`group overflow-hidden transition-all hover:shadow-xl ${
              cardStyle === "sharp" ? "rounded-none border" : cardStyle === "minimal" ? "rounded-xl" : "rounded-2xl border"
            } ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white"}`}
          >
            <div className="aspect-[16/10] overflow-hidden bg-gray-200">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={`${car.make} ${car.model}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className={`flex h-full items-center justify-center ${isDark ? "bg-white/5 text-gray-600" : "bg-gray-100 text-gray-300"}`}>
                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H18.375a1.125 1.125 0 001.125-1.125V14.25" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{car.make} {car.model}</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {car.year} {car.color && `• ${car.color}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatCurrency(car.dailyRate, currency)}</span>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>/day</p>
                </div>
              </div>
              <div className={`mt-3 flex gap-3 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {car.fuelType}</span>
                <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {car.transmission}</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {car.seats} seats</span>
              </div>
              <CarBookButton
                car={car}
                currency={currency}
                subdomain={subdomain}
                className={`mt-4 w-full rounded-lg ${accentColor} py-2.5 text-sm font-semibold text-white ${accentHover} transition-colors`}
                accentColor={accentColor}
                accentHover={accentHover}
                theme={theme}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
