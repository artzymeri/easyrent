import type { TemplateProps } from "./types";
import { formatCurrency } from "@/lib/currency";
import { Mail, Phone, MapPin, Fuel, Users, Gauge } from "lucide-react";

export function MinimalTemplate({ company, cars, currency }: TemplateProps) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-8 w-8 rounded-md object-cover" />
            )}
            <span className="text-lg font-medium">{company.name}</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-neutral-500 md:flex">
            {company.phone && <a href={`tel:${company.phone}`} className="hover:text-neutral-900">{company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="hover:text-neutral-900">{company.email}</a>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {company.name}
        </h1>
        <p className="mt-3 text-lg text-neutral-500">
          {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} available for rent
        </p>
        {(company.city || company.address) && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-400">
            <MapPin className="h-4 w-4" />
            {company.address || company.city}{company.country && `, ${company.country}`}
          </p>
        )}
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-neutral-200" />
      </div>

      {/* Cars */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        {cars.length === 0 ? (
          <p className="text-center text-neutral-400 py-12">No cars available at the moment.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const primaryImage = car.images?.find((i) => i.isPrimary) || car.images?.[0];
              return (
                <div key={car.id} className="group">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-200">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-300">No Image</div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{car.make} {car.model}</h3>
                        <p className="text-sm text-neutral-400">{car.year}</p>
                      </div>
                      <span className="text-lg font-semibold">{formatCurrency(car.dailyRate, currency)}<span className="text-sm font-normal text-neutral-400">/d</span></span>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {car.fuelType}</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> {car.transmission}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {car.seats}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-12">
        <div className="h-px bg-neutral-200" />
        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-neutral-400 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {company.phone && <a href={`tel:${company.phone}`} className="flex items-center gap-1 hover:text-neutral-900"><Phone className="h-3.5 w-3.5" /> {company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-1 hover:text-neutral-900"><Mail className="h-3.5 w-3.5" /> {company.email}</a>}
          </div>
          <p>© {new Date().getFullYear()} {company.name} · Powered by Kindura</p>
        </div>
      </footer>
    </div>
  );
}
