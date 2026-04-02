"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import {
  Car,
  CalendarDays,
  Users,
  UserCog,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const FEATURES: Feature[] = [
  { icon: Car, titleKey: "landing.featureFleetTitle", descKey: "landing.featureFleetDesc" },
  { icon: CalendarDays, titleKey: "landing.featureBookingTitle", descKey: "landing.featureBookingDesc" },
  { icon: Users, titleKey: "landing.featureCustomerTitle", descKey: "landing.featureCustomerDesc" },
  { icon: UserCog, titleKey: "landing.featureStaffTitle", descKey: "landing.featureStaffDesc" },
  { icon: BarChart3, titleKey: "landing.featureDashboardTitle", descKey: "landing.featureDashboardDesc" },
  { icon: ShieldCheck, titleKey: "landing.featureSecureTitle", descKey: "landing.featureSecureDesc" },
];

const HIGHLIGHTS = [
  "Multi-company support",
  "Role-based access control",
  "Real-time availability",
  "Damage tracking",
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground shadow-sm">
              E
            </div>
            <span className="text-xl font-bold tracking-tight">EasyRent</span>
          </div>
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              {t("landing.staffLogin")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Car className="h-4 w-4" />
              Car Rental Management Platform
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              {t("landing.heroTitle")}{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("landing.heroHighlight")}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("landing.heroDescription")}
            </p>

            {/* Quick highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {HIGHLIGHTS.map((h) => (
                <span key={h} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {h}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/login">
                <Button size="lg" className="h-12 gap-2 px-8 text-base shadow-lg shadow-primary/25">
                  {t("landing.goToDashboard")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("landing.featuresHeading")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Streamline every aspect of your car rental operations with powerful, intuitive tools.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="group relative rounded-2xl border bg-background p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">{t(f.titleKey)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to simplify your rental business?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign in to your company dashboard and start managing your fleet today.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="h-12 gap-2 px-8 text-base">
                {t("landing.staffLogin")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>{t("landing.copyright", { year: String(new Date().getFullYear()) })}</p>
        </div>
      </footer>
    </div>
  );
}
