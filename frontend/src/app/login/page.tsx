"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowRight,
  Car,
  KeyRound,
  Mail,
  Building2,
  ShieldCheck,
  CalendarDays,
  BarChart3,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !subdomain) {
      toast.error(t("login.allFieldsRequired"));
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<{
        token: string;
        user: { id: number; firstName: string; lastName: string; role: string; companyId: number };
      }>("/auth/staff/login", { email, password, subdomain });

      localStorage.setItem("staff_token", data.token);
      localStorage.setItem("staff_subdomain", subdomain);
      toast.success(t("login.welcome", { name: data.user.firstName }));
      router.push("/dashboard");
    } catch {
      toast.error(t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — Brand / Illustration ────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-cyan-500 lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse-glow" />
          <div className="absolute right-[5%] bottom-[20%] h-60 w-60 rounded-full bg-cyan-300/15 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
          <div className="absolute left-[40%] bottom-[10%] h-48 w-48 rounded-full bg-blue-300/10 blur-2xl animate-pulse-glow" style={{ animationDelay: "4s" }} />
        </div>

        {/* Floating icons */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-[22%] animate-float opacity-20">
            <Car className="h-10 w-10 text-white" />
          </div>
          <div className="absolute right-[18%] top-[18%] animate-float-slow opacity-15" style={{ animationDelay: "1s" }}>
            <CalendarDays className="h-12 w-12 text-white" />
          </div>
          <div className="absolute left-[20%] bottom-[25%] animate-float-reverse opacity-15" style={{ animationDelay: "3s" }}>
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <div className="absolute right-[15%] bottom-[35%] animate-float opacity-15" style={{ animationDelay: "2s" }}>
            <BarChart3 className="h-9 w-9 text-white" />
          </div>
        </div>

        {/* Grid dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <div className="animate-scale-in mb-8">
            <Image
              src="/logo_without_bg.png"
              alt="EasyRent"
              width={100}
              height={100}
              className="drop-shadow-2xl brightness-0 invert animate-float-slow"
              priority
            />
          </div>
          <h2 className="animate-slide-up text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
            {t("landing.heroTitle")}
          </h2>
          <p className="animate-slide-up-delay mt-4 max-w-md text-lg text-white/70">
            {t("landing.heroDescription")}
          </p>

          {/* Feature pills */}
          <div className="animate-fade-in mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.5s" }}>
            {[
              { icon: Car, label: t("landing.featureFleetTitle") },
              { icon: CalendarDays, label: t("landing.featureBookingTitle") },
              { icon: ShieldCheck, label: t("landing.featureSecureTitle") },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
              >
                <Icon className="h-4 w-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — Login form ─────────────────────────── */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Mobile header */}
        <header className="flex h-16 items-center border-b px-6 lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={28} height={28} className="drop-shadow-md" />
            <span className="text-lg font-bold">EasyRent</span>
          </Link>
          <Link href="/" className="hidden lg:inline-flex">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4 rotate-180" />
              {t("common.back")}
            </Button>
          </Link>
        </header>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Greeting */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <KeyRound className="h-3.5 w-3.5" />
                {t("login.title")}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t("login.welcome", { name: "" }).replace(", !", "").trim() || "Welcome back"}
              </h1>
              <p className="mt-2 text-muted-foreground">{t("login.description")}</p>
            </div>

            <Card className="border-0 shadow-xl shadow-black/5">
              <CardContent className="p-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="subdomain" className="text-sm font-medium">
                      {t("login.subdomain")}
                    </Label>
                    <div className="flex items-center gap-1">
                      <div className="relative flex-1">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="subdomain"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          placeholder="your-company"
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                      <span className="whitespace-nowrap rounded-lg bg-muted px-3 py-2.5 text-sm font-medium text-muted-foreground">
                        .easyrent.com
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t("login.email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {t("login.password")}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="group w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        {t("login.signingIn")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {t("login.signIn")}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {t("landing.featureSecureDesc").substring(0, 80)}…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
