"use client";

import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StaffData } from "./types";

interface StaffMembersListProps {
  staffList: StaffData[];
}

export function StaffMembersList({ staffList }: StaffMembersListProps) {
  if (staffList.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Added Members ({staffList.length})
        </p>
        <div className="space-y-3">
          {staffList.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {s.firstName} {s.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {s.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
