"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useTranslation();

  const FEATURES = [
    { icon: "🚗", titleKey: "landing.featureFleetTitle", descKey: "landing.featureFleetDesc" },
    { icon: "📅", titleKey: "landing.featureBookingTitle", descKey: "landing.featureBookingDesc" },
    { icon: "👥", titleKey: "landing.featureCustomerTitle", descKey: "landing.featureCustomerDesc" },
    { icon: "👨‍💼", titleKey: "landing.featureStaffTitle", descKey: "landing.featureStaffDesc" },
    { icon: "📊", titleKey: "landing.featureDashboardTitle", descKey: "landing.featureDashboardDesc" },
    { icon: "🔒", titleKey: "landing.featureSecureTitle", descKey: "landing.featureSecureDesc" },
  ];

  return (
    <div className="flex min-h-full flex-col">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              E
            </div>
            <span className="text-xl font-bold">EasyRent</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">{t("landing.staffLogin")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 items-center bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            {t("landing.heroTitle")}{" "}
            <span className="text-primary">{t("landing.heroHighlight")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("landing.heroDescription")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base">
                {t("landing.goToDashboard")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t("landing.featuresHeading")}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.titleKey} className="rounded-xl border p-6">
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>{t("landing.copyright", { year: String(new Date().getFullYear()) })}</p>
      </footer>
    </div>
  );
}
