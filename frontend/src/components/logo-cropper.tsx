"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Upload, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface LogoCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (base64: string) => void;
  title?: string;
  description?: string;
}

export function LogoCropper({
  open,
  onOpenChange,
  onSave,
  title,
  description,
}: LogoCropperProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  const CANVAS_SIZE = 300;
  const OUTPUT_SIZE = 400;

  const resetState = useCallback(() => {
    setImageSrc(null);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setSaving(false);
  }, []);

  useEffect(() => {
    if (!open) resetState();
  }, [open, resetState]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageSrc(reader.result as string);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const checkSize = 10;
    for (let x = 0; x < CANVAS_SIZE; x += checkSize) {
      for (let y = 0; y < CANVAS_SIZE; y += checkSize) {
        ctx.fillStyle =
          (x / checkSize + y / checkSize) % 2 === 0 ? "#f0f0f0" : "#ffffff";
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    const scale =
      Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * zoom;

    ctx.save();
    ctx.translate(CANVAS_SIZE / 2 + offset.x, CANVAS_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      (-img.width * scale) / 2,
      (-img.height * scale) / 2,
      img.width * scale,
      img.height * scale
    );
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip("evenodd");
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [zoom, rotation, offset]);

  useEffect(() => {
    if (imageSrc) drawCanvas();
  }, [imageSrc, drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    setOffset({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  };

  const handleSave = async () => {
    const img = imageRef.current;
    if (!img) return;

    setSaving(true);

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = OUTPUT_SIZE;
    outputCanvas.height = OUTPUT_SIZE;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    const scaleFactor = OUTPUT_SIZE / CANVAS_SIZE;
    const scale =
      Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * zoom;

    ctx.save();
    ctx.translate(
      OUTPUT_SIZE / 2 + offset.x * scaleFactor,
      OUTPUT_SIZE / 2 + offset.y * scaleFactor
    );
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      (-img.width * scale * scaleFactor) / 2,
      (-img.height * scale * scaleFactor) / 2,
      img.width * scale * scaleFactor,
      img.height * scale * scaleFactor
    );
    ctx.restore();

    const dataUrl = outputCanvas.toDataURL("image/webp", 0.85);
    onSave(dataUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t("settings.logoCropper.title")}</DialogTitle>
          <DialogDescription>
            {description || t("settings.logoCropper.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!imageSrc ? (
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  {t("settings.logoCropper.clickToSelect")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.logoCropper.supportedFormats")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="cursor-move rounded-lg border"
                  style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                />
              </div>

              <div className="flex items-center gap-3 px-2">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={zoom}
                  min={0.5}
                  max={3}
                  step={0.05}
                  onValueChange={(val) => setZoom(val as number)}
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                  >
                    <RotateCw className="mr-1 h-3.5 w-3.5" />
                    {t("settings.logoCropper.rotate")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("settings.logoCropper.changeImage")}
                  </Button>
                </div>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {imageSrc && (
          <DialogFooter showCloseButton>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? t("settings.logoCropper.saving")
                : t("settings.logoCropper.save")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
