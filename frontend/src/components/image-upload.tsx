"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/compress-image";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Star } from "lucide-react";
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

  return (
    <div className="space-y-3">
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={img.id ?? img.tempId ?? i}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {/* Primary badge */}
              {img.isPrimary && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  <Star className="h-2.5 w-2.5" />
                  {t("imageUpload.primary")}
                </span>
              )}
              {/* Overlay actions */}
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isPrimary && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleSetPrimary(i)}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      {t("imageUpload.setPrimary")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemove(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
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
