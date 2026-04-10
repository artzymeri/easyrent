"use client";

import { useState } from "react";
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
} from "lucide-react";

export function ForgotPasswordForm() {
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
