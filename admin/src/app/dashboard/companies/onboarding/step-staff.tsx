"use client";

import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

import type { StaffData } from "./types";
import { StaffMembersList } from "./staff-members-list";
import { PhoneCodePicker } from "./phone-code-picker";

interface StepStaffProps {
  staffList: StaffData[];
  currentStaff: StaffData;
  setCurrentStaff: React.Dispatch<React.SetStateAction<StaffData>>;
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
  const update = (field: keyof StaffData, value: string) =>
    setCurrentStaff((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Staff Members</h2>
        <p className="text-sm text-muted-foreground">
          Add at least one staff member who will manage this company
        </p>
      </div>

      <StaffMembersList staffList={staffList} />

      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">New Staff Member</p>
          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-first">First Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="staff-first" placeholder="John" className="pl-10" value={currentStaff.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-last">Last Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="staff-last" placeholder="Doe" className="pl-10" value={currentStaff.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="staff-email" type="email" placeholder="john@company.com" className="pl-10" value={currentStaff.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="staff-password" type="password" placeholder="Min. 6 characters" className="pl-10" value={currentStaff.password} onChange={(e) => update("password", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={currentStaff.role} onValueChange={(v) => update("role", v ?? "regular")}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Role">
                      {currentStaff.role === "manager" ? "Manager" : "Regular"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone</Label>
              <PhoneCodePicker
                phoneCode={currentStaff.phoneCode}
                phone={currentStaff.phone}
                onPhoneCodeChange={(code) => update("phoneCode", code)}
                onPhoneChange={(val) => update("phone", val)}
                inputId="staff-phone"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onAddStaff} disabled={loading} variant="secondary">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Staff Member
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <Button onClick={onNext} size="lg">
          <ArrowRight className="mr-2 h-4 w-4" />Continue to Cars
        </Button>
      </div>
    </div>
  );
}
