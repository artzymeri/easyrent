"use client";

import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Star, GripVertical, Play } from "lucide-react";
import type { ImageItem } from "./image-upload";

interface ImagePreviewItemProps {
  img: ImageItem;
  index: number;
  disabled: boolean;
  dragIdx: number | null;
  overIdx: number | null;
  onDragStart: (e: React.DragEvent, i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDragLeave: (i: number) => void;
  onDrop: (e: React.DragEvent, i: number) => void;
  onDragEnd: () => void;
  onSetPrimary: (i: number) => void;
  onRemove: (i: number) => void;
}

export function ImagePreviewItem({
  img,
  index,
  disabled,
  dragIdx,
  overIdx,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onSetPrimary,
  onRemove,
}: ImagePreviewItemProps) {
  const { t } = useTranslation();

  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={() => onDragLeave(index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all select-none ${
        dragIdx === index
          ? "scale-95 opacity-40 ring-2 ring-primary"
          : overIdx === index
            ? "ring-2 ring-primary ring-offset-2"
            : ""
      } ${!disabled ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {img.isVideo ? (
        <div className="relative h-full w-full">
          <video
            src={img.url}
            className="h-full w-full object-cover pointer-events-none"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/60 p-2">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={img.url}
          alt=""
          className="h-full w-full object-cover pointer-events-none"
        />
      )}

      {img.isPrimary && (
        <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">
          <Star className="h-2.5 w-2.5" />
          {t("imageUpload.primary")}
        </span>
      )}

      {!disabled && (
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-black/40 px-1 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-3 w-3" />
        </div>
      )}

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
                      onClick={() => onSetPrimary(index)}
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
                    onClick={() => onRemove(index)}
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
  );
}
