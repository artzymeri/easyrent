"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Shield,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/admin/forgot-password", { email });
      setSent(true);
      toast.success("If the email exists, a reset link has been sent.");
    } catch {
      toast.error("Failed to send reset link");
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
        <h2 className="text-xl font-bold">Check Your Email</h2>
        <p className="text-sm text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
          Please check your inbox and spam folder.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <Shield className="h-3.5 w-3.5" />
          Password Recovery
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Forgot Password
        </h1>
        <p className="mt-2 text-gray-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <Card className="border-0 bg-white shadow-xl shadow-black/5">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@easyrent.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              className="group w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

function ResetPasswordForm() {
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
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/admin/reset-password", { token, password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
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
        <h2 className="text-xl font-bold">Password Reset Complete</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link href="/">
          <Button className="mt-4 gap-2 bg-gray-900 hover:bg-gray-800">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <Shield className="h-3.5 w-3.5" />
          Password Recovery
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Set New Password
        </h1>
        <p className="mt-2 text-gray-500">
          Choose a strong password for your account
        </p>
      </div>

      <Card className="border-0 bg-white shadow-xl shadow-black/5">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              <Label htmlFor="confirm" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              className="group w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting…
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
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
  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ──────────────────────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute right-[10%] bottom-[25%] h-48 w-48 rounded-full bg-violet-500/8 blur-3xl" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <div className="mb-10">
            <div className="relative inline-flex">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-xl" />
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <Image
                  src="/logo_without_bg.png"
                  alt="EasyRent"
                  width={64}
                  height={64}
                  className="drop-shadow-2xl brightness-0 invert"
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
            Admin Control Center
          </h2>
          <p className="mt-3 max-w-sm text-base text-gray-400">
            Manage all companies, monitor fleet operations, and oversee the entire platform.
          </p>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex w-full flex-col bg-gray-50/50 lg:w-1/2">
        <header className="flex h-16 items-center border-b bg-white px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={28} height={28} className="drop-shadow-md" />
            <span className="text-lg font-bold">EasyRent Admin</span>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}>
              <ResetPasswordContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
