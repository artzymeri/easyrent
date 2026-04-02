"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "regular";
  companyId: number;
}

const NAV_KEYS = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: "📊" },
  { href: "/dashboard/bookings", labelKey: "nav.bookings", icon: "📅" },
  { href: "/dashboard/cars", labelKey: "nav.cars", icon: "🚗" },
  { href: "/dashboard/customers", labelKey: "nav.customers", icon: "👥" },
];

const MANAGER_KEYS = [
  { href: "/dashboard/staff", labelKey: "nav.staff", icon: "👨‍💼" },
];

const SETTINGS_KEY = { href: "/dashboard/settings", labelKey: "nav.settings", icon: "⚙️" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("staff_token");
    if (!token) {
      router.push("/login");
      return;
    }
    api
      .get<{ user: StaffUser }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("staff_token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_subdomain");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) return null;

  const allNav = [
    ...NAV_KEYS,
    ...(user.role === "manager" ? MANAGER_KEYS : []),
    SETTINGS_KEY,
  ];

  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            E
          </div>
          <span className="text-lg font-bold">EasyRent</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-3">
          {allNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* User section */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {t(`roles.${user.role}`)}
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            {t("common.logOut")}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center border-b px-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </Button>
          <span className="ml-2 font-bold">EasyRent</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
