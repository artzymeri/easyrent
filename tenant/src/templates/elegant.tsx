import type { TemplateProps } from "./types";
import { formatCurrency } from "@/lib/currency";
import { Mail, Phone, MapPin, Fuel, Users, Gauge } from "lucide-react";
import { CarBookButton } from "@/components/car-book-button";

export function ElegantTemplate({ company, cars, currency, subdomain }: TemplateProps) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-10 w-auto max-w-[120px] rounded-full object-contain border border-amber-700/50" />
            )}
            <h1 className="text-xl font-light tracking-widest uppercase text-amber-200">{company.name}</h1>
          </div>
          <div className="hidden items-center gap-6 text-sm text-stone-400 md:flex">
            {company.phone && <a href={`tel:${company.phone}`} className="hover:text-amber-300 transition-colors">{company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="hover:text-amber-300 transition-colors">{company.email}</a>}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900/50 to-stone-950" />
        <div className="relative">
          {company.logoUrl && (
            <div className="mb-6 flex justify-center">
              <img src={company.logoUrl} alt={company.name} className="h-14 w-auto max-w-[180px] object-contain" />
            </div>
          )}
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-600">Premium Car Rental</p>
          <h2 className="mt-4 text-4xl font-light tracking-tight text-white md:text-6xl">
            {company.slogan ? (
              <span>{company.slogan}</span>
            ) : (
              <>Luxury <span className="italic text-amber-400">Meets</span> Convenience</>
            )}
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          <p className="mx-auto mt-6 max-w-md text-stone-400">
            Experience our handpicked selection of premium vehicles
          </p>
        </div>
      </section>

      {/* Cars */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        {cars.length === 0 ? (
          <p className="text-center text-stone-500 py-12">No vehicles available at the moment.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const primaryImage = car.images?.find((i) => i.isPrimary) || car.images?.[0];
              return (
                <div key={car.id} className="group overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/50 transition-all hover:border-amber-800/50">
                  <div className="aspect-[16/10] overflow-hidden bg-stone-800">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-600">No Image</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-light tracking-wide">{car.make} <span className="font-semibold">{car.model}</span></h3>
                    <p className="mt-1 text-sm text-stone-500">{car.year} {car.color && `• ${car.color}`}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" /> {car.fuelType}</span>
                        <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /> {car.transmission}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {car.seats}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-light text-amber-400">{formatCurrency(car.dailyRate, currency)}</span>
                        <span className="text-xs text-stone-500">/day</span>
                      </div>
                    </div>
                    <CarBookButton
                      car={car}
                      currency={currency}
                      subdomain={subdomain}
                      className="mt-4 w-full rounded-lg border border-amber-700/50 bg-amber-900/20 py-2.5 text-sm font-medium text-amber-300 hover:bg-amber-900/40 transition-colors"
                      accentColor="bg-amber-700"
                      accentHover="hover:bg-amber-800"
                      theme="dark"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 px-6 py-12">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">{company.name}</p>
          {company.slogan && (
            <p className="mt-2 text-sm italic text-stone-500">{company.slogan}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500">
            {company.phone && <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 hover:text-amber-400"><Phone className="h-4 w-4" /> {company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 hover:text-amber-400"><Mail className="h-4 w-4" /> {company.email}</a>}
            {(company.city || company.address) && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {company.address || company.city}{company.country && `, ${company.country}`}</span>}
          </div>
          <p className="mt-6 text-xs text-stone-600">© {new Date().getFullYear()} {company.name} • Powered by Kindura</p>
        </div>
      </footer>
    </div>
  );
}
