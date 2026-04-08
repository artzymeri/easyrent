"use client";

import { useState } from "react";
import {
  Car,
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Palette,
  Fuel,
  Settings2,
  Hash,
  DollarSign,
  Calendar,
  Shield,
  Gauge,
  Armchair,
  Wrench,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CarData } from "./types";

const COLOR_OPTIONS = [
  "black", "white", "silver", "gray", "red", "blue",
  "green", "yellow", "orange", "brown", "beige", "gold",
  "maroon", "navy", "purple", "pink",
];

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
  { value: "needs_repair", label: "Needs Repair" },
];

const FUEL_LABELS: Record<string, string> = {
  gasoline: "Gasoline",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  plugin_hybrid: "Plugin Hybrid",
  lpg: "LPG",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

interface StepCarsProps {
  carsList: CarData[];
  currentCar: CarData;
  setCurrentCar: React.Dispatch<React.SetStateAction<CarData>>;
  makes: string[];
  models: string[];
  loading: boolean;
  onLoadModels: (make: string) => void;
  onAddCar: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepCars({
  carsList,
  currentCar,
  setCurrentCar,
  makes,
  models,
  loading,
  onLoadModels,
  onAddCar,
  onBack,
  onNext,
}: StepCarsProps) {
  const [makeOpen, setMakeOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const update = (field: keyof CarData, value: string) =>
    setCurrentCar((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Fleet</h2>
        <p className="text-sm text-muted-foreground">
          Add cars to this company&apos;s fleet (you can skip this and add later)
        </p>
      </div>

      {/* Added cars */}
      {carsList.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Added Cars ({carsList.length})
            </p>
            <div className="space-y-3">
              {carsList.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {c.make} {c.model} {c.year && `(${c.year})`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.licensePlate || "No plate"} · {c.color || "No color"}
                      </p>
                    </div>
                  </div>
                  {c.dailyRate && (
                    <Badge variant="secondary">${c.dailyRate}/day</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New car form */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">Vehicle Details</p>
          <Separator />

          {/* Make & Model */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Make <span className="text-destructive">*</span>
              </Label>
              <Popover open={makeOpen} onOpenChange={setMakeOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={makeOpen}
                      className="w-full justify-between font-normal"
                    />
                  }
                >
                  <span className={currentCar.make ? "" : "text-muted-foreground"}>
                    {currentCar.make || "Select make"}
                  </span>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search make..." />
                    <CommandList>
                      <CommandEmpty>No make found.</CommandEmpty>
                      <CommandGroup>
                        {makes.map((m) => (
                          <CommandItem
                            key={m}
                            value={m}
                            onSelect={() => {
                              update("make", m);
                              update("model", "");
                              onLoadModels(m);
                              setMakeOpen(false);
                            }}
                          >
                            <span className="flex-1">{m}</span>
                            {currentCar.make === m && (
                              <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                Model <span className="text-destructive">*</span>
              </Label>
              <Popover open={modelOpen} onOpenChange={setModelOpen}>
                <PopoverTrigger
                  disabled={!currentCar.make}
                  render={
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={modelOpen}
                      className="w-full justify-between font-normal"
                    />
                  }
                >
                  <span className={currentCar.model ? "" : "text-muted-foreground"}>
                    {currentCar.model || (currentCar.make ? "Select model" : "Select make first")}
                  </span>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search model..." />
                    <CommandList>
                      <CommandEmpty>No model found.</CommandEmpty>
                      <CommandGroup>
                        {models.map((m) => (
                          <CommandItem
                            key={m}
                            value={m}
                            onSelect={() => {
                              update("model", m);
                              setModelOpen(false);
                            }}
                          >
                            <span className="flex-1">{m}</span>
                            {currentCar.model === m && (
                              <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Year, Color, Status */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Year</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="2024"
                  className="pl-10"
                  value={currentCar.year}
                  onChange={(e) => update("year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={currentCar.color} onValueChange={(v) => update("color", v ?? "")}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select color">
                      {currentCar.color
                        ? currentCar.color.charAt(0).toUpperCase() + currentCar.color.slice(1)
                        : "Select color"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={currentCar.status} onValueChange={(v) => update("status", v ?? "available")}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Status">
                      {STATUS_OPTIONS.find((s) => s.value === currentCar.status)?.label ?? "Status"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* License Plate, VIN, Engine */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>License Plate</Label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="01-234-AB"
                  className="pl-10"
                  value={currentCar.licensePlate}
                  onChange={(e) => update("licensePlate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>VIN</Label>
              <Input
                placeholder="Vehicle identification number"
                value={currentCar.vin}
                onChange={(e) => update("vin", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Engine</Label>
              <Input
                placeholder="e.g. 2.0 TSI"
                value={currentCar.engine}
                onChange={(e) => update("engine", e.target.value)}
              />
            </div>
          </div>

          {/* Fuel, Transmission, Mileage, Seats */}
          <div className="grid gap-5 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <Select value={currentCar.fuelType} onValueChange={(v) => update("fuelType", v ?? "gasoline")}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <SelectValue>
                      {FUEL_LABELS[currentCar.fuelType] ?? "Gasoline"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="plugin_hybrid">Plugin Hybrid</SelectItem>
                  <SelectItem value="lpg">LPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transmission</Label>
              <Select value={currentCar.transmission} onValueChange={(v) => update("transmission", v ?? "automatic")}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <SelectValue>
                      {TRANSMISSION_LABELS[currentCar.transmission] ?? "Automatic"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mileage</Label>
              <div className="relative">
                <Gauge className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="km"
                  className="pl-10"
                  value={currentCar.mileage}
                  onChange={(e) => update("mileage", e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Seats</Label>
              <div className="relative">
                <Armchair className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="5"
                  className="pl-10"
                  value={currentCar.seats}
                  onChange={(e) => update("seats", e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>

          {/* Daily Rate */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Daily Rate</Label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="0.00"
                  className="pl-10"
                  value={currentCar.dailyRate}
                  onChange={(e) => update("dailyRate", e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration & Insurance */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">Registration & Insurance</p>
          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Registration Expiry</Label>
              <Input
                type="date"
                value={currentCar.registrationExpiry}
                onChange={(e) => update("registrationExpiry", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Provider name"
                  className="pl-10"
                  value={currentCar.insuranceProvider}
                  onChange={(e) => update("insuranceProvider", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Insurance Policy Number</Label>
              <Input
                placeholder="Policy #"
                value={currentCar.insurancePolicyNumber}
                onChange={(e) => update("insurancePolicyNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Insurance Expiry</Label>
              <Input
                type="date"
                value={currentCar.insuranceExpiry}
                onChange={(e) => update("insuranceExpiry", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">Service & Maintenance</p>
          <Separator />

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Last Service Date</Label>
              <Input
                type="date"
                value={currentCar.lastServiceDate}
                onChange={(e) => update("lastServiceDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Next Service Date</Label>
              <Input
                type="date"
                value={currentCar.nextServiceDate}
                onChange={(e) => update("nextServiceDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Next Service Mileage</Label>
              <div className="relative">
                <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="km"
                  className="pl-10"
                  value={currentCar.nextServiceMileage}
                  onChange={(e) => update("nextServiceMileage", e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes about this vehicle..."
              rows={3}
              value={currentCar.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add button */}
      <div className="flex justify-end">
        <Button onClick={onAddCar} disabled={loading} variant="secondary">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Car
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          <ArrowRight className="mr-2 h-4 w-4" />
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
