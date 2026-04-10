"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Hash,
  IdCard,
  Pen,
  Printer,
  Quote,
  Stamp,
  Trash2,
  Upload,
} from "lucide-react";
import type { EditFormState } from "./types";

interface CompanyEditFormProps {
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  onOpenStampCropper: () => void;
  onOpenSignaturePad: () => void;
}

export function CompanyEditForm({
  editForm,
  setEditForm,
  onOpenStampCropper,
  onOpenSignaturePad,
}: CompanyEditFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Company Details</CardTitle>
        <CardDescription>
          Update company information. Subdomain cannot be changed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="company@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={editForm.city}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, city: e.target.value }))
              }
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={editForm.country}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, country: e.target.value }))
              }
              placeholder="Country"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={editForm.address}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Full address"
              className="min-h-[80px]"
            />
          </div>

          {/* Slogan */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="slogan">Slogan</Label>
            <div className="relative">
              <Quote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="slogan"
                value={editForm.slogan}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, slogan: e.target.value }))
                }
                placeholder="Your trusted car rental partner"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">Appears on the company&apos;s public website</p>
          </div>

          {/* Business Information */}
          <div className="sm:col-span-2">
            <Separator className="my-2" />
            <p className="text-sm font-medium text-muted-foreground mb-4 mt-4">Business Information</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessNumber">Business Number</Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="businessNumber"
                value={editForm.businessNumber}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, businessNumber: e.target.value }))
                }
                placeholder="BN-12345678"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessFaxNumber">Business Fax Number</Label>
            <div className="relative">
              <Printer className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="businessFaxNumber"
                value={editForm.businessFaxNumber}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, businessFaxNumber: e.target.value }))
                }
                placeholder="+383 38 123 456"
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyIdNumber">Company ID</Label>
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="companyIdNumber"
                value={editForm.companyIdNumber}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, companyIdNumber: e.target.value }))
                }
                placeholder="ID-0001234"
                className="pl-10"
              />
            </div>
          </div>

          {/* Branding Assets */}
          <div className="sm:col-span-2">
            <Separator className="my-2" />
            <p className="text-sm font-medium text-muted-foreground mb-4 mt-4">Branding Assets</p>
          </div>

          {/* Stamp */}
          <div className="space-y-2">
            <Label>Company Stamp</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                {editForm.stampUrl ? (
                  <img src={editForm.stampUrl} alt="Stamp" className="h-full w-full object-cover" />
                ) : (
                  <Stamp className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenStampCropper}
                >
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  {editForm.stampUrl ? "Change" : "Upload"}
                </Button>
                {editForm.stampUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setEditForm((f) => ({ ...f, stampUrl: "" }))}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label>Signature</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white">
                {editForm.signature ? (
                  <img src={editForm.signature} alt="Signature" className="h-full w-auto object-contain p-1" />
                ) : (
                  <div className="flex items-center gap-1.5 text-muted-foreground/50">
                    <Pen className="h-4 w-4" />
                    <span className="text-xs">No signature</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenSignaturePad}
                >
                  <Pen className="mr-2 h-3.5 w-3.5" />
                  {editForm.signature ? "Redraw" : "Draw"}
                </Button>
                {editForm.signature && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setEditForm((f) => ({ ...f, signature: "" }))}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <Separator className="my-2" />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={editForm.isActive}
              onCheckedChange={(val) =>
                setEditForm((f) => ({ ...f, isActive: val as boolean }))
              }
            />
            <Label>Active</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
