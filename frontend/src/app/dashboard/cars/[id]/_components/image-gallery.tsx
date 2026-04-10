"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import type { CarImage } from "./types";

interface ImageGalleryProps {
  images: CarImage[];
  activeImage: number;
  setActiveImage: (idx: number | ((prev: number) => number)) => void;
  carName: string;
  noImagesLabel: string;
}

export function ImageGallery({
  images,
  activeImage,
  setActiveImage,
  carName,
  noImagesLabel,
}: ImageGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card className="overflow-hidden lg:col-span-3">
      <CardContent className="p-0">
        {sortedImages.length > 0 ? (
          <div>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              <img
                src={sortedImages[activeImage]?.url}
                alt={carName}
                className="h-full w-full object-cover transition-all duration-300"
              />
              {sortedImages.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur-sm transition hover:bg-white"
                    onClick={() =>
                      setActiveImage((prev: number) =>
                        (prev - 1 + sortedImages.length) % sortedImages.length,
                      )
                    }
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg backdrop-blur-sm transition hover:bg-white"
                    onClick={() =>
                      setActiveImage((prev: number) =>
                        (prev + 1) % sortedImages.length,
                      )
                    }
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {activeImage + 1} / {sortedImages.length}
                  </span>
                </>
              )}
            </div>
            {sortedImages.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto p-3">
                {sortedImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === activeImage
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center bg-muted/30 text-muted-foreground">
            <ImageIcon className="mb-3 h-16 w-16 opacity-30" />
            <p className="text-sm">{noImagesLabel}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
