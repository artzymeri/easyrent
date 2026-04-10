"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/compress-image";
import { toast } from "sonner";
import { ImagePreviewItem } from "./image-preview-item";
import { ImageDropZone } from "./image-drop-zone";

export interface ImageItem {
  tempId?: string;
  id?: number;
  url: string;
  isPrimary: boolean;
  isVideo?: boolean;
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  max?: number;
  disabled?: boolean;
  allowVideo?: boolean;
  maxVideoSizeMB?: number;
}

export function ImageUpload({
  images,
  onChange,
  max = 10,
  disabled = false,
  allowVideo = false,
  maxVideoSizeMB = 50,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const [compressing, setCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const acceptedTypes = allowVideo
        ? (f: File) => f.type.startsWith("image/") || f.type.startsWith("video/")
        : (f: File) => f.type.startsWith("image/");

      const fileArray = Array.from(files).filter(acceptedTypes);
      if (fileArray.length === 0) return;

      const remaining = max - images.length;
      if (remaining <= 0) {
        toast.error(t("imageUpload.maxReached", { max: String(max) }));
        return;
      }

      const toProcess = fileArray.slice(0, remaining);
      setCompressing(true);

      try {
        const newImages: ImageItem[] = [];
        for (let i = 0; i < toProcess.length; i++) {
          const file = toProcess[i];
          const isVideo = file.type.startsWith("video/");
          if (isVideo) {
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > maxVideoSizeMB) {
              toast.error(t("mediaUpload.videoTooLarge", { max: String(maxVideoSizeMB) }));
              continue;
            }
            const url = await readFileAsDataURL(file);
            newImages.push({ tempId: `new-${Date.now()}-${i}`, url, isPrimary: images.length === 0 && newImages.length === 0, isVideo: true });
          } else {
            const url = await compressImage(file);
            newImages.push({ tempId: `new-${Date.now()}-${i}`, url, isPrimary: images.length === 0 && newImages.length === 0 });
          }
        }
        if (newImages.length > 0) onChange([...images, ...newImages]);
      } catch {
        toast.error(t("imageUpload.compressFailed"));
      } finally {
        setCompressing(false);
      }
    },
    [images, max, onChange, t, allowVideo, maxVideoSizeMB],
  );

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) updated[0].isPrimary = true;
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleReorderDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/x-reorder", String(index));
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(index);
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragIdx !== null && index !== dragIdx) setOverIdx(index);
  };

  const handleReorderDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIdx === null || dragIdx === index) { setDragIdx(null); setOverIdx(null); return; }
    const updated = [...images];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(index, 0, moved);
    onChange(updated);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleReorderDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  const isReorderDrag = (e: React.DragEvent) =>
    dragIdx !== null || e.dataTransfer.types.includes("text/x-reorder");

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img, i) => (
            <ImagePreviewItem
              key={img.id ?? img.tempId ?? i}
              img={img}
              index={i}
              disabled={disabled}
              dragIdx={dragIdx}
              overIdx={overIdx}
              onDragStart={handleReorderDragStart}
              onDragOver={handleReorderDragOver}
              onDragLeave={(idx) => { if (overIdx === idx) setOverIdx(null); }}
              onDrop={handleReorderDrop}
              onDragEnd={handleReorderDragEnd}
              onSetPrimary={handleSetPrimary}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {!disabled && images.length < max && (
        <ImageDropZone
          max={max}
          currentCount={images.length}
          disabled={disabled}
          compressing={compressing}
          allowVideo={allowVideo}
          dragOver={dragOver}
          setDragOver={setDragOver}
          isReorderDrag={isReorderDrag}
          onFiles={(files) => processFiles(files)}
          onEndReorder={() => { setDragIdx(null); setOverIdx(null); }}
        />
      )}
    </div>
  );
}
