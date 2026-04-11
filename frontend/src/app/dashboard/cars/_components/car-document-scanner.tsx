"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Upload, Scan, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { CarFormData, CarColor } from "./types";

interface CarDocumentScannerProps {
  onScanComplete: (data: Partial<CarFormData>) => void;
  carColors: CarColor[];
  t: (key: string, params?: Record<string, string>) => string;
}

interface ExtractedCarData {
  usable: boolean;
  licensePlate?: string;
  make?: string;
  model?: string;
  variant?: string;
  year?: string;
  vin?: string;
  engineCapacity?: string;
  enginePower?: string;
  fuelType?: string;
  colorName?: string;
  seats?: string;
  registrationDate?: string;
  ownerName?: string;
}

export function CarDocumentScanner({ onScanComplete, carColors, t }: CarDocumentScannerProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("carsPage.scanner.invalidFileType"));
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("carsPage.scanner.fileTooLarge"));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imagePreview) return;

    setScanning(true);
    try {
      // Send to backend AI for extraction
      const extractedData = await api.post<ExtractedCarData>("/cars/scan-document", {
        image: imagePreview,
      });

      if (!extractedData.usable) {
        toast.error(t("carsPage.scanner.notRecognized"));
        return;
      }
      
      // Map extracted data to form data
      const formData: Partial<CarFormData> = {};

      if (extractedData.licensePlate) {
        formData.licensePlate = extractedData.licensePlate;
      }
      if (extractedData.make) {
        formData.make = extractedData.make;
      }
      if (extractedData.model) {
        formData.model = extractedData.model;
      }
      if (extractedData.year) {
        formData.year = extractedData.year;
      }
      if (extractedData.vin) {
        formData.vin = extractedData.vin;
      }
      if (extractedData.engineCapacity) {
        formData.engine = `${extractedData.engineCapacity} cc${extractedData.enginePower ? ` / ${extractedData.enginePower} kW` : ""}`;
      }
      if (extractedData.seats) {
        formData.seats = extractedData.seats;
      }
      if (extractedData.fuelType) {
        // Map fuel type to our enum
        const fuelMap: Record<string, string> = {
          "benzinë": "gasoline",
          "benzine": "gasoline",
          "gasoline": "gasoline",
          "petrol": "gasoline",
          "dizel": "diesel",
          "diesel": "diesel",
          "elektrik": "electric",
          "electric": "electric",
          "hibrid": "hybrid",
          "hybrid": "hybrid",
          "plugin_hybrid": "plugin_hybrid",
          "lpg": "lpg",
          "gaz": "lpg",
        };
        const normalizedFuel = extractedData.fuelType.toLowerCase().split(" ")[0];
        formData.fuelType = fuelMap[normalizedFuel] || "gasoline";
      }

      // Try to match color
      if (extractedData.colorName) {
        const colorMatch = matchColor(extractedData.colorName, carColors);
        if (colorMatch) {
          formData.colorId = String(colorMatch.id);
        }
      }

      onScanComplete(formData);
      toast.success(t("carsPage.scanner.success"));
      setOpen(false);
      setImagePreview(null);
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(t("carsPage.scanner.failed"));
    } finally {
      setScanning(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <Scan className="size-4" />
            {t("carsPage.scanner.scanDocument")}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("carsPage.scanner.title")}</DialogTitle>
          <DialogDescription>
            {t("carsPage.scanner.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!imagePreview ? (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex gap-2">
                <Camera className="size-8 text-muted-foreground" />
                <Upload className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{t("carsPage.scanner.uploadPrompt")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("carsPage.scanner.uploadHint")}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Document preview"
                className="w-full rounded-lg object-contain max-h-[400px]"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {imagePreview && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={clearImage}
                disabled={scanning}
              >
                {t("carsPage.scanner.retake")}
              </Button>
              <Button
                type="button"
                className="flex-1 gap-2"
                onClick={handleScan}
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <Spinner className="size-4" />
                    {t("carsPage.scanner.scanning")}
                  </>
                ) : (
                  <>
                    <Scan className="size-4" />
                    {t("carsPage.scanner.extractData")}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to match color names to our color database
function matchColor(colorName: string, carColors: CarColor[]): CarColor | null {
  const normalized = colorName.toLowerCase().trim();
  
  // Color mapping for common variations (Albanian and English)
  const colorMappings: Record<string, string[]> = {
    white: ["e bardhë", "bardhe", "bardhë", "white", "e bardhe"],
    black: ["e zezë", "zeze", "zezë", "black", "e zeze"],
    silver: ["argjend", "silver", "gri argjend"],
    gray: ["gri", "grey", "gray", "e hirtë", "hirte", "hirtë", "e hirte"],
    metallic_gray: ["gri metalik", "metallic gray", "e hirtë metalike", "hirte metalike"],
    dark_gray: ["gri e errët", "dark gray", "dark grey"],
    red: ["e kuqe", "kuqe", "red"],
    dark_red: ["e kuqe e errët", "dark red"],
    burgundy: ["bordo", "burgundy"],
    blue: ["blu", "blue", "e kaltër", "kalter"],
    dark_blue: ["blu e errët", "dark blue", "blu e erret"],
    navy: ["blu e detit", "navy", "navy blue"],
    light_blue: ["blu e çelët", "light blue", "blu e celet"],
    green: ["e gjelbër", "gjelber", "gjelbër", "green"],
    dark_green: ["e gjelbër e errët", "dark green"],
    yellow: ["e verdhë", "verdhe", "yellow"],
    gold: ["ar", "ari", "gold", "golden"],
    orange: ["portokalli", "orange"],
    brown: ["kafe", "brown", "café"],
    beige: ["bezhë", "bezhe", "beige"],
    purple: ["vjollcë", "vjollce", "purple", "violet"],
    pink: ["rozë", "roze", "pink"],
    bronze: ["bronz", "bronze"],
    champagne: ["shampanjë", "shampanje", "champagne"],
    titanium: ["titan", "titanium"],
    graphite: ["grafit", "graphite"],
  };

  // First try direct match
  for (const color of carColors) {
    if (
      color.code === normalized ||
      color.nameEn.toLowerCase() === normalized ||
      color.nameSq.toLowerCase() === normalized
    ) {
      return color;
    }
  }

  // Then try mapping
  for (const [code, variants] of Object.entries(colorMappings)) {
    for (const variant of variants) {
      if (normalized.includes(variant) || variant.includes(normalized)) {
        const match = carColors.find(c => c.code === code);
        if (match) return match;
      }
    }
  }

  // Try partial word matching as last resort
  const words = normalized.split(/[\s-_]+/);
  for (const word of words) {
    if (word.length < 3) continue;
    for (const color of carColors) {
      if (
        color.code.includes(word) ||
        color.nameEn.toLowerCase().includes(word) ||
        color.nameSq.toLowerCase().includes(word)
      ) {
        return color;
      }
    }
  }

  return null;
}
