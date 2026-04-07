"use client";

import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Car, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import type { CarData } from "./types";

interface StepCarsProps {
  carsList: CarData[];
  currentCar: CarData;
  setCurrentCar: (data: CarData) => void;
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Fleet Vehicles</h2>
        <p className="text-sm text-muted-foreground">
          Add cars now or skip this step — you can always add them later
        </p>
      </div>

      {/* Added Cars */}
      {carsList.length > 0 && (
        <div className="space-y-2">
          {carsList.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Car className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {c.make} {c.model}
                  {c.year && <span className="ml-1 font-normal text-muted-foreground">({c.year})</span>}
                </div>
                {c.licensePlate && (
                  <div className="text-xs text-muted-foreground">{c.licensePlate}</div>
                )}
              </div>
              {c.dailyRate && (
                <Badge variant="outline">{formatCurrency(c.dailyRate)}/day</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Car Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {carsList.length === 0 ? "Add First Car" : "Add Another Car"}
            </span>
          </div>

          {/* Make & Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Make <span className="text-red-500">*</span></Label>
              <Select
                value={currentCar.make}
                onValueChange={(val) => {
                  setCurrentCar({ ...currentCar, make: val ?? "", model: "" });
                  if (val) onLoadModels(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Model <span className="text-red-500">*</span></Label>
              <Select
                value={currentCar.model}
                onValueChange={(val) => setCurrentCar({ ...currentCar, model: val ?? "" })}
                disabled={!currentCar.make}
              >
                <SelectTrigger>
                  <SelectValue placeholder={currentCar.make ? "Select model" : "Select make first"} />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Year / Color / Plate */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Year</Label>
              <Input
                type="number"
                value={currentCar.year}
                onChange={(e) => setCurrentCar({ ...currentCar, year: e.target.value })}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Color</Label>
              <Input
                value={currentCar.color}
                onChange={(e) => setCurrentCar({ ...currentCar, color: e.target.value })}
                placeholder="Black"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">License Plate</Label>
              <Input
                value={currentCar.licensePlate}
                onChange={(e) => setCurrentCar({ ...currentCar, licensePlate: e.target.value })}
                placeholder="01-234-AB"
              />
            </div>
          </div>

          {/* Engine / Fuel / Transmission */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Engine</Label>
              <Input
                value={currentCar.engine}
                onChange={(e) => setCurrentCar({ ...currentCar, engine: e.target.value })}
                placeholder="2.0L Turbo"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Fuel Type</Label>
              <Select
                value={currentCar.fuelType}
                onValueChange={(val) => setCurrentCar({ ...currentCar, fuelType: val ?? "gasoline" })}
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label className="text-sm">Transmission</Label>
              <Select
                value={currentCar.transmission}
                onValueChange={(val) => setCurrentCar({ ...currentCar, transmission: val ?? "automatic" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mileage / Seats / Rate */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Mileage (km)</Label>
              <Input
                type="number"
                value={currentCar.mileage}
                onChange={(e) => setCurrentCar({ ...currentCar, mileage: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Seats</Label>
              <Input
                type="number"
                value={currentCar.seats}
                onChange={(e) => setCurrentCar({ ...currentCar, seats: e.target.value })}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Daily Rate ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={currentCar.dailyRate}
                onChange={(e) => setCurrentCar({ ...currentCar, dailyRate: e.target.value })}
                placeholder="50.00"
              />
            </div>
          </div>

          <Separator />

          {/* Insurance / Registration */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Registration Expiry</Label>
              <DatePicker
                value={currentCar.registrationExpiry}
                onChange={(val) => setCurrentCar({ ...currentCar, registrationExpiry: val })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Insurance Provider</Label>
              <Input
                value={currentCar.insuranceProvider}
                onChange={(e) => setCurrentCar({ ...currentCar, insuranceProvider: e.target.value })}
                placeholder="ABC Insurance"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Insurance Expiry</Label>
              <DatePicker
                value={currentCar.insuranceExpiry}
                onChange={(val) => setCurrentCar({ ...currentCar, insuranceExpiry: val })}
              />
            </div>
          </div>

          <Button onClick={onAddCar} disabled={loading} variant="secondary" className="gap-2 w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Car
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button size="lg" onClick={onNext} className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
