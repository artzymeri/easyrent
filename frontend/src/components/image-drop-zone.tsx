"use client";

import { useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { ImagePlus } from "lucide-react";

interface ImageDropZoneProps {
  max: number;
  currentCount: number;
  disabled: boolean;
  compressing: boolean;
  allowVideo: boolean;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  isReorderDrag: (e: React.DragEvent) => boolean;
  onFiles: (files: FileList) => void;
  onEndReorder: () => void;
}

export function ImageDropZone({
  max,
  currentCount,
  disabled,
  compressing,
  allowVideo,
  dragOver,
  setDragOver,
  isReorderDrag,
  onFiles,
  onEndReorder,
}: ImageDropZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
          e.preventDefault();
          onEndReorder();
          return;
        }
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) {
          onFiles(e.dataTransfer.files);
        }
      }}
    >
      <ImagePlus className="h-8 w-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">
          {compressing
            ? t("imageUpload.compressing")
            : allowVideo
              ? t("mediaUpload.dropOrClick")
              : t("imageUpload.dropOrClick")}
        </p>
        <p className="text-xs text-muted-foreground">
          {allowVideo ? t("mediaUpload.formats") : t("imageUpload.formats")} &middot;{" "}
          {t("imageUpload.remaining", {
            count: String(max - currentCount),
          })}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={allowVideo ? "image/*,video/*" : "image/*"}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onFiles(e.target.files);
            e.target.value = "";
          }
        }}
        disabled={disabled || compressing}
      />
    </div>
  );
}
