"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Building2,
  Camera,
  Edit2,
  MapPin,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { Company, EditFormState } from "./types";

interface CompanyHeaderProps {
  company: Company;
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  editForm: EditFormState;
  onBack: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onOpenLogoCropper: () => void;
}

export function CompanyHeader({
  company,
  editing,
  saving,
  deleting,
  onBack,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onToggleStatus,
  onOpenLogoCropper,
}: CompanyHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Logo */}
        <div className="group relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-muted bg-muted/50 sm:h-20 sm:w-20 sm:rounded-2xl">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground sm:h-8 sm:w-8" />
            )}
          </div>
          <button
            onClick={onOpenLogoCropper}
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 sm:rounded-2xl"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
              {company.name}
            </h1>
            <Badge variant={company.isActive ? "default" : "destructive"}>
              {company.isActive ? "Active" : "Inactive"}
            </Badge>
            {!company.onboardingCompleted && (
              <Badge variant="secondary">Onboarding Incomplete</Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {company.subdomain}
            </code>
            <span className="text-sm">.easyrent.com</span>
          </p>
          {(company.city || company.country) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {company.city}
              {company.country ? `, ${company.country}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        {!editing ? (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={company.isActive ? "destructive" : "default"}
              size="sm"
              onClick={onToggleStatus}
            >
              {company.isActive ? "Deactivate" : "Activate"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Company</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete{" "}
                    <strong>{company.name}</strong>? This will permanently
                    remove the company, all staff, cars, and bookings. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={onDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete Company"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onCancelEdit}>
              <X className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving}>
              <Save className="mr-1 h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
