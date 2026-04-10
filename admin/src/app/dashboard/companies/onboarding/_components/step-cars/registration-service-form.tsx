"use client";

import { Shield, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { CarData } from "../../types";

interface RegistrationServiceFormProps {
  currentCar: CarData;
  update: (field: keyof CarData, value: string) => void;
}

export function RegistrationServiceForm({
  currentCar,
  update,
}: RegistrationServiceFormProps) {
  return (
    <>
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
    </>
  );
}
