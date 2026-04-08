"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  Plus,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

import type { StaffData } from "./types";
import { PHONE_CODES } from "./country-data";

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
  const [phoneCodeOpen, setPhoneCodeOpen] = useState(false);

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

      {/* Added staff list */}
      {staffList.length > 0 && (
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
      )}

      {/* New staff form */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">New Staff Member</p>
          <Separator />

          {/* Name row */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-first">
                First Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-first"
                  placeholder="John"
                  className="pl-10"
                  value={currentStaff.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-last">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-last"
                  placeholder="Doe"
                  className="pl-10"
                  value={currentStaff.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="john@company.com"
                  className="pl-10"
                  value={currentStaff.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  className="pl-10"
                  value={currentStaff.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Role & Phone */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={currentStaff.role}
                onValueChange={(v) => update("role", v ?? "regular")}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Role" />
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
              <div className="flex gap-2">
                <Popover open={phoneCodeOpen} onOpenChange={setPhoneCodeOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={phoneCodeOpen}
                        className="w-[110px] shrink-0 justify-between px-3 font-normal"
                      />
                    }
                  >
                    <span className="truncate">{currentStaff.phoneCode}</span>
                    <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search code..." />
                      <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                          {PHONE_CODES.map((pc) => (
                            <CommandItem
                              key={`${pc.code}-${pc.country}`}
                              value={`${pc.country} ${pc.code}`}
                              onSelect={() => {
                                update("phoneCode", pc.code);
                                setPhoneCodeOpen(false);
                              }}
                            >
                              <span className="flex-1 truncate text-sm">{pc.country}</span>
                              <span className="ml-2 text-xs text-muted-foreground">{pc.code}</span>
                              {currentStaff.phoneCode === pc.code && (
                                <Check className="ml-1 h-3.5 w-3.5 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="relative flex-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="staff-phone"
                    placeholder="44 123 456"
                    className="pl-10"
                    value={currentStaff.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add button */}
          <div className="flex justify-end pt-2">
            <Button onClick={onAddStaff} disabled={loading} variant="secondary">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Staff Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          <ArrowRight className="mr-2 h-4 w-4" />
          Continue to Cars
        </Button>
      </div>
    </div>
  );
}
