"use client";

import { useTranslation } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { DocumentItem } from "./types";

interface DocumentUploadSectionProps {
  documents: DocumentItem[];
  extracting: boolean;
  isDisabled: boolean;
  docInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  docTypeLabel: (type: string) => string;
}

export function DocumentUploadSection({
  documents,
  extracting,
  isDisabled,
  docInputRef,
  onUpload,
  onRemove,
  docTypeLabel,
}: DocumentUploadSectionProps) {
  const { t } = useTranslation();

  return (
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
            <div key={doc.id || doc.tempId || idx} className="group relative">
              <img
                src={doc.url}
                alt={docTypeLabel(doc.documentType)}
                className="h-20 w-16 rounded-md border object-cover"
              />
              <Badge
                variant="secondary"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-1 py-0"
              >
                {docTypeLabel(doc.documentType)}
              </Badge>
              {!isDisabled && (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!isDisabled && (
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
      )}

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
        disabled={isDisabled || extracting}
      />

      {!isDisabled && documents.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {t("customersPage.documents.hint")}
        </p>
      )}
    </div>
  );
}
