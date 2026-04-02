"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalCost: number;
  dailyRate: number;
  pickupLocation: string;
  returnLocation: string;
  Customer: { id: number; firstName: string; lastName: string; phone: string };
  Car: { id: number; make: string; model: string; licensePlate: string };
  createdAt: string;
}

interface Car {
  id: number;
  make: string;
  model: string;
  licensePlate: string;
  dailyRate: number;
  status: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

// Calendar helper
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_KEYS = [
  "bookingsPage.months.january", "bookingsPage.months.february", "bookingsPage.months.march",
  "bookingsPage.months.april", "bookingsPage.months.may", "bookingsPage.months.june",
  "bookingsPage.months.july", "bookingsPage.months.august", "bookingsPage.months.september",
  "bookingsPage.months.october", "bookingsPage.months.november", "bookingsPage.months.december",
];

const DAY_KEYS = [
  "bookingsPage.calendarDays.sun", "bookingsPage.calendarDays.mon", "bookingsPage.calendarDays.tue",
  "bookingsPage.calendarDays.wed", "bookingsPage.calendarDays.thu", "bookingsPage.calendarDays.fri",
  "bookingsPage.calendarDays.sat",
];

const STATUS_COLORS: Record<string, string> = {
  pending_start: "bg-yellow-200 text-yellow-900",
  in_progress: "bg-blue-200 text-blue-900",
  completed: "bg-green-200 text-green-900",
  cancelled: "bg-gray-200 text-gray-600",
  overdue: "bg-red-200 text-red-900",
  pending_return: "bg-orange-200 text-orange-900",
};

export default function BookingsPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const [form, setForm] = useState({
    carId: "",
    customerId: "",
    startDate: "",
    endDate: "",
    dailyRate: "",
    pickupLocation: "",
    returnLocation: "",
  });

  const subdomain = typeof window !== "undefined" ? localStorage.getItem("staff_subdomain") || "" : "";

  const fetchAll = async () => {
    try {
      const [bookingData, carData, custData] = await Promise.all([
        api.get<{ rows: Booking[] }>(`/bookings?subdomain=${subdomain}&limit=100`),
        api.get<{ rows: Car[] }>(`/cars?subdomain=${subdomain}`),
        api.get<{ rows: Customer[] }>(`/customers?subdomain=${subdomain}`),
      ]);
      setBookings(bookingData.rows || []);
      setCars(carData.rows || []);
      setCustomers(custData.rows || []);
    } catch {
      toast.error(t("bookingsPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carId || !form.customerId || !form.startDate || !form.endDate) {
      toast.error(t("bookingsPage.validation.required"));
      return;
    }

    setSaving(true);
    try {
      await api.post(`/bookings?subdomain=${subdomain}`, {
        carId: parseInt(form.carId),
        customerId: parseInt(form.customerId),
        startDate: form.startDate,
        endDate: form.endDate,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
        pickupLocation: form.pickupLocation,
        returnLocation: form.returnLocation,
      });
      toast.success(t("bookingsPage.toast.created"));
      setForm({ carId: "", customerId: "", startDate: "", endDate: "", dailyRate: "", pickupLocation: "", returnLocation: "" });
      setDialogOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("bookingsPage.toast.failedCreate"));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (bookingId: number, status: string) => {
    try {
      await api.put(`/bookings/${bookingId}/status?subdomain=${subdomain}`, { status });
      toast.success(t("bookingsPage.toast.statusUpdated"));
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("bookingsPage.toast.failedUpdate"));
    }
  };

  // Calendar rendering
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    const getBookingsForDay = (day: number) => {
      const date = new Date(calYear, calMonth, day);
      return bookings.filter((b) => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end && b.status !== "cancelled";
      });
    };

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    // Pad last week
    while (weeks.length > 0 && weeks[weeks.length - 1].length < 7) {
      weeks[weeks.length - 1].push(null);
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => {
              if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
              else setCalMonth(calMonth - 1);
            }}>
              ←
            </Button>
            <CardTitle>{t(MONTH_KEYS[calMonth])} {calYear}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => {
              if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
              else setCalMonth(calMonth + 1);
            }}>
              →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px rounded-lg border bg-border">
            {DAY_KEYS.map((dk) => (
              <div key={dk} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                {t(dk)}
              </div>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                const dayBookings = day ? getBookingsForDay(day) : [];
                const isToday = day &&
                  calYear === new Date().getFullYear() &&
                  calMonth === new Date().getMonth() &&
                  day === new Date().getDate();

                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`min-h-[80px] bg-white p-1 ${
                      isToday ? "ring-2 ring-primary ring-inset" : ""
                    } ${!day ? "bg-muted/50" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`mb-1 text-xs ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayBookings.slice(0, 3).map((b) => (
                            <div
                              key={b.id}
                              className={`truncate rounded px-1 text-[10px] leading-4 ${
                                STATUS_COLORS[b.status] || "bg-gray-100"
                              }`}
                              title={`${b.Car?.make} ${b.Car?.model} — ${b.Customer?.firstName} ${b.Customer?.lastName}`}
                            >
                              {b.Car?.make} {b.Car?.model}
                            </div>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-[10px] text-muted-foreground">
                              {t("common.more", { count: String(dayBookings.length - 3) })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("bookingsPage.loadingBookings")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("bookingsPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("bookingsPage.subtitle", { count: String(bookings.length) })}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              {t("bookingsPage.calendarView")}
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              {t("bookingsPage.listView")}
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button>{t("bookingsPage.newBooking")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("bookingsPage.dialogTitle")}</DialogTitle>
                <DialogDescription>{t("bookingsPage.dialogDescription")}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("bookingsPage.customer")} *</Label>
                  <Select value={form.customerId} onValueChange={(val) => setForm({ ...form, customerId: val ?? "" })}>
                    <SelectTrigger><SelectValue placeholder={t("bookingsPage.selectCustomer")} /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.firstName} {c.lastName} ({c.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("bookingsPage.car")} *</Label>
                  <Select
                    value={form.carId}
                    onValueChange={(val) => {
                      const car = cars.find((c) => String(c.id) === val);
                      setForm({
                        ...form,
                        carId: val ?? "",
                        dailyRate: car?.dailyRate ? String(car.dailyRate) : form.dailyRate,
                      });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder={t("bookingsPage.selectCar")} /></SelectTrigger>
                    <SelectContent>
                      {cars.filter((c) => c.status === "available").map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.make} {c.model} ({c.licensePlate}) — ${c.dailyRate}/day
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.startDate")} *</Label>
                    <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.endDate")} *</Label>
                    <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("bookingsPage.dailyRate")}</Label>
                  <Input type="number" step="0.01" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.pickupLocation")}</Label>
                    <Input value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("bookingsPage.returnLocation")}</Label>
                    <Input value={form.returnLocation} onChange={(e) => setForm({ ...form, returnLocation: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
                  <Button type="submit" disabled={saving}>{saving ? t("bookingsPage.creating") : t("bookingsPage.createBooking")}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && renderCalendar()}

      {/* List View */}
      {view === "list" && (
        <Card>
          <CardContent className="pt-6">
            {bookings.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                {t("bookingsPage.emptyState")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("bookingsPage.tableHeaders.customer")}</TableHead>
                    <TableHead>{t("bookingsPage.tableHeaders.car")}</TableHead>
                    <TableHead>{t("bookingsPage.tableHeaders.dates")}</TableHead>
                    <TableHead>{t("bookingsPage.tableHeaders.cost")}</TableHead>
                    <TableHead>{t("bookingsPage.tableHeaders.status")}</TableHead>
                    <TableHead>{t("bookingsPage.tableHeaders.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {b.Customer?.firstName} {b.Customer?.lastName}
                      </TableCell>
                      <TableCell>
                        {b.Car?.make} {b.Car?.model}
                        {b.Car?.licensePlate && (
                          <span className="ml-1 text-xs text-muted-foreground">({b.Car.licensePlate})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(b.startDate).toLocaleDateString()} →{" "}
                        {new Date(b.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {b.totalCost ? `$${b.totalCost}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.status === "in_progress"
                              ? "default"
                              : b.status === "completed"
                              ? "secondary"
                              : b.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {b.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {b.status === "pending_start" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "in_progress")}>
                              {t("bookingsPage.start")}
                            </Button>
                          )}
                          {b.status === "in_progress" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "completed")}>
                              {t("bookingsPage.complete")}
                            </Button>
                          )}
                          {(b.status === "pending_start" || b.status === "in_progress") && (
                            <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "cancelled")}>
                              {t("common.cancel")}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
