"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Building2,
  CheckCircle2,
  Loader2,
  Car,
  ShieldCheck,
} from "lucide-react";

function ForgotPasswordForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subdomain) {
      toast.error(t("login.allFieldsRequired"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/staff/forgot-password", { email, subdomain });
      setSent(true);
      toast.success(t("resetPassword.linkSent"));
    } catch {
      toast.error(t("resetPassword.sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">{t("resetPassword.checkEmail")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("resetPassword.checkEmailDesc", { email })}
        </p>
        <Link href="/login">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("resetPassword.backToLogin")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <KeyRound className="h-3.5 w-3.5" />
          {t("resetPassword.recovery")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("resetPassword.forgotTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("resetPassword.forgotDescription")}
        </p>
      </div>

      <Card className="border-0 shadow-xl shadow-black/5">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    onChange={(e) =>
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    placeholder="your-company"
                    className="pl-10 h-11"
                    required
                  />
                </div>
                <span className="whitespace-nowrap rounded-lg bg-muted px-3 py-2.5 text-sm font-medium text-muted-foreground">
                  .kindura.app
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
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="group w-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("resetPassword.sending")}
                </span>
              ) : (
                t("resetPassword.sendLink")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("resetPassword.backToLogin")}
        </Link>
      </div>
    </>
  );
}

function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(t("resetPassword.noMatch"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("resetPassword.minLength"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/staff/reset-password", { token, password });
      setSuccess(true);
      toast.success(t("resetPassword.success"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("resetPassword.failed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold">{t("resetPassword.completeTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("resetPassword.completeDesc")}
        </p>
        <Link href="/login">
          <Button className="mt-4">{t("login.signIn")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <KeyRound className="h-3.5 w-3.5" />
          {t("resetPassword.recovery")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("resetPassword.newPasswordTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("resetPassword.newPasswordDesc")}
        </p>
      </div>

      <Card className="border-0 shadow-xl shadow-black/5">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("resetPassword.newPassword")}
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium">
                {t("resetPassword.confirmPassword")}
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10 h-11"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="group w-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("resetPassword.resetting")}
                </span>
              ) : (
                t("resetPassword.resetButton")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("resetPassword.backToLogin")}
        </Link>
      </div>
    </>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const hasToken = searchParams.has("token");
  return hasToken ? <ResetPasswordForm /> : <ForgotPasswordForm />;
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ──────────────────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-cyan-500 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-[5%] bottom-[20%] h-60 w-60 rounded-full bg-cyan-300/15 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-[22%] opacity-20">
            <Car className="h-10 w-10 text-white" />
          </div>
          <div className="absolute right-[15%] bottom-[35%] opacity-15">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <div className="mb-8">
            <Image
              src="/logo_without_bg.png"
              alt="EasyRent"
              width={100}
              height={100}
              className="drop-shadow-2xl brightness-0 invert"
              priority
            />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
            {t("landing.heroTitle")}
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/70">
            {t("landing.heroDescription")}
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex w-full flex-col lg:w-1/2">
        <header className="flex h-16 items-center border-b px-6">
          <Link href="/login" className="flex items-center gap-2">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={28} height={28} className="drop-shadow-md" />
            <span className="text-lg font-bold">EasyRent</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Suspense
              fallback={
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <ResetPasswordContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
