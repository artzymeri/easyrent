"use client";

import { Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CarData } from "../../types";

interface AddedCarsListProps {
  carsList: CarData[];
}

export function AddedCarsList({ carsList }: AddedCarsListProps) {
  if (carsList.length === 0) return null;

  return (
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
  );
}
