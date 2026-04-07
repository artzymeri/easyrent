import type { TemplateProps } from "./types";
import { formatCurrency } from "@/lib/currency";
import { Mail, Phone, MapPin, Fuel, Users, Gauge, ArrowRight } from "lucide-react";

export function ModernTemplate({ company, cars, currency }: TemplateProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/50" />
            )}
            <span className="text-lg font-bold text-white">{company.name}</span>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {company.phone && (
              <a href={`tel:${company.phone}`} className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
                Call Us
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative z-10 px-6 text-center">
          <div className="mb-4 inline-block rounded-full bg-violet-600/20 px-4 py-1.5 text-sm font-medium text-violet-300">
            {cars.length} vehicles available
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
            Drive Your <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Dream</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-slate-400">
            Premium car rental experience. Pick your ride and hit the road.
          </p>
          <a href="#cars" className="mt-8 inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-3 font-semibold text-white hover:bg-violet-700">
            Browse Cars <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Cars */}
      <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Our Fleet</h2>
          <p className="mt-2 text-gray-500">Choose from our carefully maintained vehicles</p>
        </div>
        {cars.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No cars available at the moment.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => {
              const primaryImage = car.images?.find((i) => i.isPrimary) || car.images?.[0];
              return (
                <div key={car.id} className="group overflow-hidden rounded-2xl bg-gray-50 transition-all hover:shadow-xl">
                  <div className="aspect-[16/10] overflow-hidden bg-gray-200">
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">No Image</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{car.make} {car.model}</h3>
                        <p className="text-sm text-gray-400">{car.year} {car.color && `• ${car.color}`}</p>
                      </div>
                      <div className="rounded-xl bg-violet-100 px-3 py-1.5">
                        <span className="text-lg font-bold text-violet-700">{formatCurrency(car.dailyRate, currency)}</span>
                        <span className="text-xs text-violet-500">/day</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Fuel className="h-4 w-4" /> {car.fuelType}</span>
                      <span className="flex items-center gap-1"><Gauge className="h-4 w-4" /> {car.transmission}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {car.seats}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Contact */}
      <section className="bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-bold">Get In Touch</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-slate-300">
            {company.phone && <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-violet-400"><Phone className="h-5 w-5" /> {company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-violet-400"><Mail className="h-5 w-5" /> {company.email}</a>}
            {(company.city || company.address) && <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> {company.address || company.city}{company.country && `, ${company.country}`}</span>}
          </div>
          <p className="mt-8 text-sm text-slate-500">© {new Date().getFullYear()} {company.name} • Powered by Kindura</p>
        </div>
      </section>
    </div>
  );
}
