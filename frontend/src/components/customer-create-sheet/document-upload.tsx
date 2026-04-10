"use client";

import { useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  X,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { DocumentItem } from "./types";

interface DocumentUploadProps {
  documents: DocumentItem[];
  extracting: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

function docTypeLabel(type: string, t: (key: string) => string) {
  const labels: Record<string, string> = {
    id_card: t("customersPage.documents.types.idCard"),
    drivers_license: t("customersPage.documents.types.driversLicense"),
    passport: t("customersPage.documents.types.passport"),
    other: t("customersPage.documents.types.other"),
  };
  return labels[type] || type;
}

export function DocumentUpload({
  documents,
  extracting,
  onUpload,
  onRemove,
}: DocumentUploadProps) {
  const { t } = useTranslation();
  const docInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <FileText className="h-4 w-4" />
            {t("customersPage.documents.title")}
          </Label>
          {extracting && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t("customersPage.documents.analyzing")}
            </div>
          )}
        </div>

        {/* Uploaded documents thumbnails */}
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {documents.map((doc, idx) => (
              <div
                key={doc.id || doc.tempId || idx}
                className="group relative"
              >
                <img
                  src={doc.url}
                  alt={docTypeLabel(doc.documentType, t)}
                  className="h-20 w-16 rounded-md border object-cover"
                />
                <Badge
                  variant="secondary"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 py-0 text-[10px]"
                >
                  {docTypeLabel(doc.documentType, t)}
                </Badge>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        <div
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          onClick={() => docInputRef.current?.click()}
        >
          {extracting ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
              {t("customersPage.documents.analyzing")}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {t("customersPage.documents.upload")}
            </>
          )}
        </div>

        <input
          ref={docInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onUpload(e.target.files);
            e.target.value = "";
          }}
          disabled={extracting}
        />

        {documents.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {t("customersPage.documents.hint")}
          </p>
        )}
      </div>

      {extracting && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            {t("customersPage.documents.aiWorking")}
          </p>
        </div>
      )}

      <Separator />
    </>
  );
}
