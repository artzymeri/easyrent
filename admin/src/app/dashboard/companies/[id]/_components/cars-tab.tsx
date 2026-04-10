"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { Car } from "lucide-react";
import type { CarItem } from "./types";

interface CarsTabProps {
  cars: CarItem[];
  currency: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case "available":
      return "default";
    case "rented":
      return "destructive";
    case "maintenance":
      return "secondary";
    default:
      return "outline";
  }
};

export function CarsTab({ cars, currency }: CarsTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Car className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No cars added yet</p>
            <p className="text-xs text-muted-foreground">
              Cars will appear here once the company adds them.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead>Fuel / Trans.</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.make} {c.model}
                    {c.year ? ` (${c.year})` : ""}
                    {c.color ? ` • ${c.color}` : ""}
                  </TableCell>
                  <TableCell>
                    {c.licensePlate ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {c.licensePlate}
                      </code>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {c.fuelType} / {c.transmission}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.mileage?.toLocaleString()} km
                  </TableCell>
                  <TableCell>
                    {c.dailyRate
                      ? `${formatCurrency(c.dailyRate, currency)}/day`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusColor(c.status) as
                          | "default"
                          | "destructive"
                          | "secondary"
                          | "outline"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
