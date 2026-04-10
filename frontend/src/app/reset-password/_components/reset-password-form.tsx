"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  CheckCircle2,
  Loader2,
} from "lucide-react";

export function ResetPasswordForm() {
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
