"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eraser, Check, Pen } from "lucide-react";

interface SignaturePadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (base64: string) => void;
  existingSignature?: string | null;
}

export function SignaturePad({
  open,
  onOpenChange,
  onSave,
  existingSignature,
}: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    setIsEmpty(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsEmpty(true);
    }
  }, [open]);

  // Load existing signature when dialog opens
  useEffect(() => {
    if (open && existingSignature && sigRef.current) {
      // Small delay to ensure canvas is ready
      const timer = setTimeout(() => {
        try {
          sigRef.current?.fromDataURL(existingSignature, {
            width: 500,
            height: 200,
          });
          setIsEmpty(false);
        } catch {
          // Ignore errors loading existing signature
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, existingSignature]);

  const handleSave = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const base64 = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    onSave(base64);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="h-4 w-4" />
            Draw Signature
          </DialogTitle>
          <DialogDescription>
            Use your mouse or finger to draw a signature below
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: "w-full rounded-lg cursor-crosshair",
              style: { width: "100%", height: "200px" },
            }}
            penColor="black"
            minWidth={1.5}
            maxWidth={3}
            onBegin={() => setIsEmpty(false)}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClear} disabled={isEmpty}>
            <Eraser className="mr-2 h-4 w-4" />
            Clear
          </Button>
          <Button onClick={handleSave} disabled={isEmpty}>
            <Check className="mr-2 h-4 w-4" />
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
