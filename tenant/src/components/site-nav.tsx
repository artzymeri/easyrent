"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import type { Company } from "@/lib/types";

interface SiteNavProps {
  company: Company;
  subdomain: string;
  page?: string;
  variant?: "light" | "dark" | "transparent";
  accentColor?: string;
}

const NAV_LABELS: Record<string, string> = {
  home: "Home",
  cars: "Cars",
  about: "About",
  contact: "Contact",
  blog: "Blog",
};

function buildHref(link: string, subdomain: string) {
  if (link === "home") return `/?subdomain=${subdomain}`;
  if (link === "cars") return `/?subdomain=${subdomain}#cars`;
  return `/${link}?subdomain=${subdomain}`;
}

export function SiteNav({ company, subdomain, page = "home", variant = "dark", accentColor }: SiteNavProps) {
  const [open, setOpen] = useState(false);
  const navLinks = company.websiteNavLinks || ["home", "cars", "about", "contact", "blog"];

  const bgClass = variant === "transparent"
    ? "bg-transparent absolute top-0 left-0 right-0 z-50"
    : variant === "dark"
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900 border-b";

  const textClass = variant === "light" ? "text-gray-700" : "text-white/80";
  const activeClass = variant === "light" ? "text-gray-900 font-semibold" : "text-white font-semibold";

  return (
    <nav className={`${bgClass} transition-colors`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={`/?subdomain=${subdomain}`} className="flex items-center gap-3">
          {company.logoUrl && (
            <img src={company.logoUrl} alt={company.name} className="h-9 w-auto max-w-[120px] rounded-lg object-contain" />
          )}
          <span className="text-lg font-bold">{company.name}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.filter(l => l !== "cars").map((link) => (
            <Link
              key={link}
              href={buildHref(link, subdomain)}
              className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 ${
                page === link ? activeClass : textClass
              }`}
            >
              {NAV_LABELS[link] || link}
            </Link>
          ))}
          {navLinks.includes("cars") && (
            <Link
              href={`/?subdomain=${subdomain}#cars`}
              className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10 ${textClass}`}
            >
              Cars
            </Link>
          )}
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="ml-2 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: accentColor || "#2563eb" }}
            >
              <Phone className="h-3.5 w-3.5" /> Call Us
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 md:hidden hover:bg-white/10">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={`border-t ${variant === "light" ? "bg-white border-gray-100" : "bg-gray-900 border-white/10"} px-6 py-4 md:hidden`}>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link}
                href={buildHref(link, subdomain)}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  page === link ? activeClass : textClass
                }`}
              >
                {NAV_LABELS[link] || link}
              </Link>
            ))}
            {company.phone && (
              <a href={`tel:${company.phone}`} className="mt-2 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white" style={{ backgroundColor: accentColor || "#2563eb" }}>
                <Phone className="h-3.5 w-3.5" /> {company.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
