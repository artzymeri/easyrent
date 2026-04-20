import { Mail, Phone, MapPin } from "lucide-react";
import type { Company } from "@/lib/types";

interface SiteFooterProps {
  company: Company;
  variant?: "light" | "dark";
  accentColor?: string;
}

export function SiteFooter({ company, variant = "light", accentColor }: SiteFooterProps) {
  const isDark = variant === "dark";
  const bgClass = isDark ? "bg-gray-950 text-gray-400 border-gray-800" : "bg-gray-50 text-gray-500 border-gray-200";
  const hoverClass = isDark ? "hover:text-white" : "hover:text-gray-900";

  return (
    <footer className={`border-t ${bgClass} px-6 py-12`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              {company.logoUrl && (
                <img src={company.logoUrl} alt={company.name} className="h-8 w-auto rounded object-contain" />
              )}
              <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{company.name}</p>
            </div>
            {company.slogan && <p className="mt-1 text-sm italic">{company.slogan}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {company.phone && (
              <a href={`tel:${company.phone}`} className={`flex items-center gap-1.5 ${hoverClass} transition-colors`}>
                <Phone className="h-4 w-4" /> {company.phone}
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className={`flex items-center gap-1.5 ${hoverClass} transition-colors`}>
                <Mail className="h-4 w-4" /> {company.email}
              </a>
            )}
            {(company.city || company.address) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {company.address || company.city}{company.country && `, ${company.country}`}
              </span>
            )}
          </div>
        </div>
        <div className="mt-8 text-center text-xs">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p className="mt-1 opacity-60">Powered by Kindura</p>
        </div>
      </div>
    </footer>
  );
}
