import type { TemplateProps } from "./types";
import { formatCurrency } from "@/lib/currency";
import { Mail, Phone, MapPin, Fuel, Users, Gauge, Zap } from "lucide-react";

export function SportyTemplate({ company, cars, currency }: TemplateProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-lg object-cover" />
            )}
            <h1 className="text-xl font-black uppercase tracking-wider">{company.name}</h1>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold uppercase tracking-wide hover:bg-red-700">
                <Phone className="mr-1.5 inline h-4 w-4" /> Call Now
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(239,68,68,0.12),transparent_50%)]" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[200px] font-black uppercase leading-none text-zinc-900/50 select-none">
          RENT
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-red-500">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-widest">{cars.length} Cars Ready</span>
          </div>
          <h2 className="mt-4 text-5xl font-black uppercase leading-tight md:text-7xl">
            Feel The<br />
            <span className="text-red-500">Power</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-zinc-400">
            High-performance rentals for those who demand the best.
          </p>
        </div>
      </section>

      {/* Cars */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h3 className="mb-10 text-2xl font-black uppercase tracking-wide">Our Garage</h3>
        {cars.length === 0 ? (
          <p className="text-center text-zinc-500 py-12">Garage is empty at the moment.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const primaryImage = car.images?.find((i) => i.isPrimary) || car.images?.[0];
              return (
                <div key={car.id} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all hover:border-red-600/50">
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-800">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600">No Image</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold uppercase">{car.make} {car.model}</h4>
                        <p className="text-sm text-zinc-500">{car.year} {car.color && `• ${car.color}`}</p>
                      </div>
                      <span className="text-2xl font-black text-red-500">{formatCurrency(car.dailyRate, currency)}</span>
                    </div>
                    <div className="mt-4 flex gap-3 text-xs uppercase tracking-wide text-zinc-400">
                      <span className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1"><Fuel className="h-3.5 w-3.5" /> {car.fuelType}</span>
                      <span className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1"><Gauge className="h-3.5 w-3.5" /> {car.transmission}</span>
                      <span className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1"><Users className="h-3.5 w-3.5" /> {car.seats}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <p className="font-black uppercase tracking-widest">{company.name}</p>
              {(company.city || company.address) && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500"><MapPin className="h-4 w-4" /> {company.address || company.city}{company.country && `, ${company.country}`}</p>
              )}
            </div>
            <div className="flex gap-6 text-sm text-zinc-400">
              {company.phone && <a href={`tel:${company.phone}`} className="flex items-center gap-1.5 hover:text-red-400"><Phone className="h-4 w-4" /> {company.phone}</a>}
              {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-1.5 hover:text-red-400"><Mail className="h-4 w-4" /> {company.email}</a>}
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-zinc-600">© {new Date().getFullYear()} {company.name} • Powered by Kindura</p>
        </div>
      </footer>
    </div>
  );
}
