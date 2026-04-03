"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImagePlus, X, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";

export interface ImageItem {
  /** Temporary id for new images (client-side only) */
  tempId?: string;
  /** Database id for existing images */
  id?: number;
  /** Base64 data URI */
  url: string;
  isPrimary: boolean;
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  /** Max number of images allowed */
  max?: number;
  disabled?: boolean;
}

export function ImageUpload({
  images,
  onChange,
  max = 10,
  disabled = false,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Drag-to-reorder state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (fileArray.length === 0) return;

      const remaining = max - images.length;
      if (remaining <= 0) {
        toast.error(t("imageUpload.maxReached", { max: String(max) }));
        return;
      }

      const toProcess = fileArray.slice(0, remaining);
      setCompressing(true);

      try {
        const compressed = await Promise.all(
          toProcess.map((f) => compressImage(f)),
        );

        const newImages: ImageItem[] = compressed.map((url, i) => ({
          tempId: `new-${Date.now()}-${i}`,
          url,
          isPrimary: images.length === 0 && i === 0,
        }));

        onChange([...images, ...newImages]);
      } catch {
        toast.error(t("imageUpload.compressFailed"));
      } finally {
        setCompressing(false);
      }
    },
    [images, max, onChange, t],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If we removed the primary, make the first one primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  // ── Drag-to-reorder handlers ──────────────────────────────────
  const handleReorderDragStart = (e: React.DragEvent, index: number) => {
    // Mark this as an internal reorder drag (not a file drop)
    e.dataTransfer.setData("text/x-reorder", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(index);
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragIdx !== null && index !== dragIdx) {
      setOverIdx(index);
    }
  };

  const handleReorderDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIdx === null || dragIdx === index) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const updated = [...images];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(index, 0, moved);
    onChange(updated);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleReorderDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  /** Check whether a drag event is an internal reorder (not files from desktop) */
  const isReorderDrag = (e: React.DragEvent) =>
    dragIdx !== null || e.dataTransfer.types.includes("text/x-reorder");

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, i) => (
            <div
              key={img.id ?? img.tempId ?? i}
              draggable={!disabled}
              onDragStart={(e) => handleReorderDragStart(e, i)}
              onDragOver={(e) => handleReorderDragOver(e, i)}
              onDragLeave={() => { if (overIdx === i) setOverIdx(null); }}
              onDrop={(e) => handleReorderDrop(e, i)}
              onDragEnd={handleReorderDragEnd}
              className={`group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all select-none ${
                dragIdx === i
                  ? "scale-95 opacity-40 ring-2 ring-primary"
                  : overIdx === i
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
              } ${!disabled ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover pointer-events-none"
              />
              {/* Primary badge */}
              {img.isPrimary && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">
                  <Star className="h-2.5 w-2.5" />
                  {t("imageUpload.primary")}
                </span>
              )}
              {/* Drag handle hint – bottom left */}
              {!disabled && (
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-black/40 px-1 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-3 w-3" />
                </div>
              )}
              {/* Action buttons – top-right corner */}
              {!disabled && (
                <TooltipProvider>
                  <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!img.isPrimary && (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-full shadow-md"
                              onClick={() => handleSetPrimary(i)}
                            />
                          }
                        >
                          <Star className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          {t("imageUpload.setPrimary")}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-md"
                            onClick={() => handleRemove(i)}
                          />
                        }
                      >
                        <X className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {t("common.delete")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {!disabled && images.length < max && (
        <div
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            if (isReorderDrag(e)) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (isReorderDrag(e)) {
              // End the reorder – drop landed outside the grid
              e.preventDefault();
              setDragIdx(null);
              setOverIdx(null);
              return;
            }
            handleDrop(e);
          }}
        >
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              {compressing
                ? t("imageUpload.compressing")
                : t("imageUpload.dropOrClick")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("imageUpload.formats")} &middot;{" "}
              {t("imageUpload.remaining", {
                count: String(max - images.length),
              })}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || compressing}
          />
        </div>
      )}
    </div>
  );
}
