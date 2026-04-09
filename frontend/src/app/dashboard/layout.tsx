"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { SocketProvider, useSocket } from "@/lib/socket-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  LayoutDashboard,
  CalendarDays,
  Car,
  Users,
  UserCog,
  Settings,
  Menu,
  Inbox,
} from "lucide-react";

interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "regular";
  companyId: number;
}

const NAV_KEYS = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", labelKey: "nav.bookings", icon: CalendarDays },
  { href: "/dashboard/booking-requests", labelKey: "nav.bookingRequests", icon: Inbox },
  { href: "/dashboard/cars", labelKey: "nav.cars", icon: Car },
  { href: "/dashboard/customers", labelKey: "nav.customers", icon: Users },
];

const MANAGER_KEYS = [
  { href: "/dashboard/staff", labelKey: "nav.staff", icon: UserCog },
];

const SETTINGS_KEY = { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);

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
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SocketProvider companyId={user.companyId}>
      <DashboardShell user={user} onLogout={handleLogout}>
        {children}
      </DashboardShell>
    </SocketProvider>
  );
}

// ── Inner shell that can access SocketProvider ────────────────
function DashboardShell({
  user,
  onLogout,
  children,
}: {
  user: StaffUser;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { pendingRequestCount } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="flex h-16 items-center gap-2.5 border-b px-4">
          <Image src="/logo_without_bg.png" alt="EasyRent" width={30} height={30} className="drop-shadow-md" />
          <span className="text-lg font-bold">EasyRent</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-3">
          {allNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const showBadge = item.href === "/dashboard/booking-requests" && pendingRequestCount > 0;
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
                <Icon className="h-4 w-4" />
                <span className="flex-1">{t(item.labelKey)}</span>
                {showBadge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                    {pendingRequestCount}
                  </span>
                )}
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
          <Button variant="outline" size="sm" className="w-full" onClick={onLogout}>
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
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 flex items-center gap-2">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={24} height={24} />
            <span className="font-bold">EasyRent</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
