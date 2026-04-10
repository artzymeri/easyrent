"use client";

import {
  Palette,
  Fuel,
  Settings2,
  Hash,
  DollarSign,
  Calendar,
  Gauge,
  Armchair,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CarData } from "../../types";
import { COLOR_OPTIONS, STATUS_OPTIONS, FUEL_LABELS, TRANSMISSION_LABELS } from "./constants";
import { MakeModelSelector } from "./make-model-selector";

interface VehicleDetailsFormProps {
  currentCar: CarData;
  update: (field: keyof CarData, value: string) => void;
  makes: string[];
  models: string[];
  makeOpen: boolean;
  setMakeOpen: (open: boolean) => void;
  modelOpen: boolean;
  setModelOpen: (open: boolean) => void;
  onLoadModels: (make: string) => void;
}

export function VehicleDetailsForm({
  currentCar,
  update,
  makes,
  models,
  makeOpen,
  setMakeOpen,
  modelOpen,
  setModelOpen,
  onLoadModels,
}: VehicleDetailsFormProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <p className="text-sm font-medium text-muted-foreground">Vehicle Details</p>
        <Separator />

        <MakeModelSelector
          currentCar={currentCar}
          update={update}
          makes={makes}
          models={models}
          makeOpen={makeOpen}
          setMakeOpen={setMakeOpen}
          modelOpen={modelOpen}
          setModelOpen={setModelOpen}
          onLoadModels={onLoadModels}
        />

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
  );
}
