"use client";

import Link from "next/link";
import Image from "next/image";
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
  Sparkles,
  Zap,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  gradient: string;
}

const FEATURES: Feature[] = [
  { icon: Car, titleKey: "landing.featureFleetTitle", descKey: "landing.featureFleetDesc", gradient: "from-blue-500 to-cyan-400" },
  { icon: CalendarDays, titleKey: "landing.featureBookingTitle", descKey: "landing.featureBookingDesc", gradient: "from-violet-500 to-purple-400" },
  { icon: Users, titleKey: "landing.featureCustomerTitle", descKey: "landing.featureCustomerDesc", gradient: "from-emerald-500 to-teal-400" },
  { icon: UserCog, titleKey: "landing.featureStaffTitle", descKey: "landing.featureStaffDesc", gradient: "from-amber-500 to-orange-400" },
  { icon: BarChart3, titleKey: "landing.featureDashboardTitle", descKey: "landing.featureDashboardDesc", gradient: "from-rose-500 to-pink-400" },
  { icon: ShieldCheck, titleKey: "landing.featureSecureTitle", descKey: "landing.featureSecureDesc", gradient: "from-indigo-500 to-blue-400" },
];

const STATS = [
  { value: "99.9%", label: "Uptime" },
  { value: "10x", label: "Faster Booking" },
  { value: "24/7", label: "Fleet Tracking" },
  { value: "100%", label: "Cloud Based" },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background">
      {/* ── Navigation ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={36} height={36} className="drop-shadow-lg" />
            <span className="text-xl font-bold tracking-tight">EasyRent</span>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5">
              {t("landing.staffLogin")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-primary/15 blur-[120px] animate-pulse-glow" />
          <div className="absolute right-[5%] top-[40%] h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-[10%] left-[30%] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "4s" }} />
        </div>

        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[8%] top-[25%] animate-float opacity-20">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute right-[15%] top-[15%] animate-float-slow opacity-15" style={{ animationDelay: "1s" }}>
            <CalendarDays className="h-10 w-10 text-violet-500" />
          </div>
          <div className="absolute left-[20%] bottom-[20%] animate-float-reverse opacity-15" style={{ animationDelay: "3s" }}>
            <ShieldCheck className="h-9 w-9 text-emerald-500" />
          </div>
          <div className="absolute right-[10%] bottom-[30%] animate-float opacity-15" style={{ animationDelay: "2s" }}>
            <BarChart3 className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="animate-slide-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary shadow-lg shadow-primary/5">
              <Sparkles className="h-4 w-4" />
              Car Rental Management Platform
              <Zap className="h-3.5 w-3.5" />
            </div>

            {/* Logo hero */}
            <div className="animate-scale-in mb-10">
              <Image
                src="/logo_without_bg.png"
                alt="EasyRent"
                width={140}
                height={140}
                className="mx-auto drop-shadow-2xl animate-float-slow"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="animate-slide-up text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              {t("landing.heroTitle")}{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  {t("landing.heroHighlight")}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400 opacity-60 blur-sm" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-slide-up-delay mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("landing.heroDescription")}
            </p>

            {/* CTA buttons */}
            <div className="animate-slide-up-delay mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: "0.4s" }}>
              <Link href="/login">
                <Button size="lg" className="group relative h-14 gap-2.5 overflow-hidden rounded-xl px-10 text-base font-semibold shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02]">
                  <span className="relative z-10 flex items-center gap-2.5">
                    {t("landing.goToDashboard")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Quick highlights */}
            <div className="animate-fade-in mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm" style={{ animationDelay: "0.6s" }}>
              {[
                "Multi-company support",
                "Role-based access",
                "Real-time availability",
                "Damage tracking",
              ].map((h) => (
                <span key={h} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ribbon ───────────────────────────────────── */}
      <section className="relative border-y bg-gradient-to-r from-primary/5 via-violet-500/5 to-cyan-500/5">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="animate-slide-up flex flex-col items-center gap-1 p-8 sm:p-10" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{s.value}</span>
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="relative py-28 sm:py-36">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="animate-slide-up mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {t("landing.featuresHeading")}
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Streamline every aspect of your car rental operations with powerful, intuitive tools.
            </p>
          </div>

          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="animate-slide-up group relative overflow-hidden rounded-2xl border bg-background/80 backdrop-blur-sm p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Gradient corner accent */}
                  <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${f.gradient} opacity-[0.07] transition-all duration-300 group-hover:opacity-[0.15] group-hover:scale-150`} />

                  <div className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative mb-2 text-lg font-semibold tracking-tight">{t(f.titleKey)}</h3>
                  <p className="relative text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-violet-500/5 to-cyan-500/10" />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px] animate-pulse-glow" />
          <div className="absolute left-[15%] bottom-[10%] h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 text-center">
          <div className="animate-slide-up">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={64} height={64} className="mx-auto mb-8 animate-float-slow drop-shadow-xl" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to simplify your rental business?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Sign in to your company dashboard and start managing your fleet today.
            </p>
            <div className="mt-10">
              <Link href="/login">
                <Button size="lg" className="group h-14 gap-2.5 rounded-xl px-10 text-base font-semibold shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02]">
                  {t("landing.staffLogin")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t bg-muted/30 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={24} height={24} className="opacity-60" />
            <span className="text-sm font-medium text-muted-foreground">EasyRent</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("landing.copyright", { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </footer>
    </div>
  );
}
