import { Mail, Phone, MapPin, Clock } from "lucide-react";
import type { Company, WebsitePage } from "@/lib/types";

interface ContactSectionProps {
  company: Company;
  page: WebsitePage;
  variant?: "light" | "dark";
  accentColor?: string;
}

export function ContactSection({ company, page, variant = "light", accentColor = "#2563eb" }: ContactSectionProps) {
  const isDark = variant === "dark";
  const extra = page.extraData as Record<string, string>;

  return (
    <div className={`${isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
      {page.heroImageUrl && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={page.heroImageUrl} alt={page.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">{page.title}</h1>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-6 py-16">
        {!page.heroImageUrl && (
          <h1 className="mb-8 text-3xl font-bold md:text-4xl">{page.title}</h1>
        )}

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            {page.content && (
              <div
                className={`prose max-w-none mb-8 ${isDark ? "prose-invert" : ""}`}
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}

            <div className="space-y-4">
              {company.phone && (
                <a href={`tel:${company.phone}`} className={`flex items-center gap-3 text-lg ${isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"} transition-colors`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "20" }}>
                    <Phone className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  {company.phone}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className={`flex items-center gap-3 text-lg ${isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"} transition-colors`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "20" }}>
                    <Mail className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  {company.email}
                </a>
              )}
              {(company.address || company.city) && (
                <div className={`flex items-center gap-3 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "20" }}>
                    <MapPin className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  {company.address || company.city}{company.country && `, ${company.country}`}
                </div>
              )}
              {extra?.hours && (
                <div className={`flex items-center gap-3 text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: accentColor + "20" }}>
                    <Clock className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  {extra.hours}
                </div>
              )}
            </div>
          </div>

          {extra?.mapEmbed && (
            <div className="overflow-hidden rounded-xl border">
              <iframe
                src={extra.mapEmbed}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
