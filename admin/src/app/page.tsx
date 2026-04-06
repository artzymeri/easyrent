"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  ArrowRight,
  Mail,
  KeyRound,
  Shield,
  Building2,
  Users,
  BarChart3,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.post<{ token: string; user: { firstName: string } }>(
        "/auth/admin/login",
        { email, password }
      );
      localStorage.setItem("admin_token", data.token);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel — Dark brand panel ────────────────────── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* Subtle accent glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute right-[10%] bottom-[25%] h-48 w-48 rounded-full bg-violet-500/8 blur-3xl" />
          <div className="absolute left-[40%] bottom-[15%] h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Decorative lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
          <div className="absolute left-[80%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
          <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute top-[70%] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          {/* Logo */}
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

          {/* Feature pills */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { icon: Building2, label: "Company Management" },
              { icon: Users, label: "User Oversight" },
              { icon: BarChart3, label: "Platform Analytics" },
              { icon: Globe, label: "Multi-Tenant Control" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left backdrop-blur-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Subtle divider */}
          <div className="mt-12 flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/10" />
            <Shield className="h-4 w-4 text-gray-600" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Restricted access — administrators only
          </p>
        </div>
      </div>

      {/* ── Right panel — Login form ─────────────────────────── */}
      <div className="flex w-full flex-col bg-gray-50/50 lg:w-1/2">
        {/* Mobile header */}
        <header className="flex h-16 items-center border-b bg-white px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={28} height={28} className="drop-shadow-md" />
            <span className="text-lg font-bold">EasyRent Admin</span>
          </div>
        </header>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Greeting */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <Shield className="h-3.5 w-3.5" />
                Administration
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>
              <p className="mt-2 text-gray-500">
                Sign in to the administration dashboard
              </p>
            </div>

            <Card className="border-0 bg-white shadow-xl shadow-black/5">
              <CardContent className="p-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
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

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
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
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="group w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all hover:shadow-xl hover:shadow-gray-900/25"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs text-gray-400">
              Secured with JWT authentication and encrypted credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}