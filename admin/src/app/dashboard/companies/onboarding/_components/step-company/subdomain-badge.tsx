"use client";

import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { SubdomainStatus } from "../../types";

export function SubdomainBadge({ status }: { status: SubdomainStatus }) {
  switch (status) {
    case "checking":
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking…
        </span>
      );
    case "available":
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Available
        </span>
      );
    case "taken":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          Already taken
        </span>
      );
    case "reserved":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          Reserved
        </span>
      );
    case "invalid":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          Invalid format
        </span>
      );
    default:
      return null;
  }
}
