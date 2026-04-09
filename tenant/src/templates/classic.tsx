import type { TemplateProps } from "./types";
import { formatCurrency } from "@/lib/currency";
import { Mail, Phone, MapPin, Fuel, Users, Gauge } from "lucide-react";
import { CarBookButton } from "@/components/car-book-button";

export function ClassicTemplate({ company, cars, currency, subdomain }: TemplateProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b bg-slate-800 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-10 w-auto max-w-[120px] rounded-lg object-contain" />
            )}
            <h1 className="text-xl font-bold">{company.name}</h1>
          </div>
          <div className="hidden items-center gap-6 text-sm md:flex">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 hover:text-blue-300">
                <Phone className="h-4 w-4" /> {company.phone}
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 hover:text-blue-300">
                <Mail className="h-4 w-4" /> {company.email}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-20 text-center text-white">
        {company.logoUrl && (
          <div className="mb-6 flex justify-center">
            <img src={company.logoUrl} alt={company.name} className="h-16 w-auto max-w-[200px] object-contain" />
          </div>
        )}
        <h2 className="text-4xl font-bold md:text-5xl">
          {company.slogan || "Rent Your Perfect Car"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Browse our selection of quality vehicles. Affordable rates, reliable cars.
        </p>
        <div className="mt-6 text-sm text-slate-400">
          {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} available
        </div>
      </section>

      {/* Cars Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="mb-8 text-2xl font-bold">Available Cars</h3>
        {cars.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No cars available at the moment.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const primaryImage = car.images?.find((i) => i.isPrimary) || car.images?.[0];
              return (
                <div key={car.id} className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="aspect-[16/10] bg-gray-100">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H18.375a1.125 1.125 0 001.125-1.125V14.25" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">{car.make} {car.model}</h4>
                        <p className="text-sm text-gray-500">{car.year} {car.color && `• ${car.color}`}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-blue-600">{formatCurrency(car.dailyRate, currency)}</span>
                        <p className="text-xs text-gray-500">/day</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {car.fuelType}</span>
                      <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {car.transmission}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {car.seats} seats</span>
                    </div>
                    <CarBookButton
                      car={car}
                      currency={currency}
                      subdomain={subdomain}
                      className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      accentColor="bg-blue-600"
                      accentHover="hover:bg-blue-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-6">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 hover:text-gray-700">
                <Phone className="h-4 w-4" /> {company.phone}
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 hover:text-gray-700">
                <Mail className="h-4 w-4" /> {company.email}
              </a>
            )}
            {(company.city || company.address) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {company.address || company.city}{company.country && `, ${company.country}`}
              </span>
            )}
          </div>
          {company.slogan && (
            <p className="mb-2 text-sm italic text-gray-400">{company.slogan}</p>
          )}
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-400">Powered by Kindura</p>
        </div>
      </footer>
    </div>
  );
}
