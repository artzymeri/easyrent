"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import type { StaffData } from "./types";

interface StepStaffProps {
  staffList: StaffData[];
  currentStaff: StaffData;
  setCurrentStaff: (data: StaffData) => void;
  loading: boolean;
  onAddStaff: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepStaff({
  staffList,
  currentStaff,
  setCurrentStaff,
  loading,
  onAddStaff,
  onBack,
  onNext,
}: StepStaffProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Staff Members</h2>
        <p className="text-sm text-muted-foreground">
          Add at least one staff member who will manage the company
        </p>
      </div>

      {/* Added Staff */}
      {staffList.length > 0 && (
        <div className="space-y-2">
          {staffList.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                {s.firstName[0]}{s.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {s.firstName} {s.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </div>
              <Badge variant={s.role === "manager" ? "default" : "secondary"} className="capitalize">
                {s.role}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {staffList.length === 0 ? "Add First Staff Member" : "Add Another Staff Member"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">First Name <span className="text-red-500">*</span></Label>
              <Input
                value={currentStaff.firstName}
                onChange={(e) => setCurrentStaff({ ...currentStaff, firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Last Name <span className="text-red-500">*</span></Label>
              <Input
                value={currentStaff.lastName}
                onChange={(e) => setCurrentStaff({ ...currentStaff, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Email <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={currentStaff.email}
                onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                value={currentStaff.password}
                onChange={(e) => setCurrentStaff({ ...currentStaff, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Role <span className="text-red-500">*</span></Label>
              <Select
                value={currentStaff.role}
                onValueChange={(val) => setCurrentStaff({ ...currentStaff, role: val as "manager" | "regular" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone</Label>
              <Input
                value={currentStaff.phone}
                onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
                placeholder="+383 44 000 000"
              />
            </div>
          </div>

          <Button onClick={onAddStaff} disabled={loading} variant="secondary" className="gap-2 w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Adding…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Staff Member
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
        <Button size="lg" className="gap-2" onClick={onNext}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
