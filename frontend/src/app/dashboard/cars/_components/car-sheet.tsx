"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import type { ImageItem } from "@/components/image-upload";
import type { CarFormData, DocumentItem, CarColor } from "./types";
import { CarFormFields } from "./car-form-fields";
import { CarFormService } from "./car-form-service";
import { CarDocumentScanner } from "./car-document-scanner";

interface CarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetMode: "create" | "edit";
  sheetLoading: boolean;
  saving: boolean;
  form: CarFormData;
  setForm: React.Dispatch<React.SetStateAction<CarFormData>>;
  makes: string[];
  models: string[];
  carColors: CarColor[];
  loadModels: (make: string) => void;
  images: ImageItem[];
  documents: DocumentItem[];
  onImageChange: (updated: ImageItem[]) => void;
  onDocumentFiles: (files: FileList | File[]) => void;
  onRemoveDocument: (index: number) => void;
  docInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string, params?: Record<string, string>) => string;
  locale: string;
}

export function CarSheet({
  open,
  onOpenChange,
  sheetMode,
  sheetLoading,
  saving,
  form,
  setForm,
  makes,
  models,
  carColors,
  loadModels,
  images,
  documents,
  onImageChange,
  onDocumentFiles,
  onRemoveDocument,
  docInputRef,
  onSubmit,
  t,
  locale,
}: CarSheetProps) {
  const handleScanComplete = (data: Partial<CarFormData>) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));
    // If make was extracted, load models for it
    if (data.make) {
      loadModels(data.make);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <div className="flex items-center justify-between gap-2">
            <div>
              <SheetTitle>{sheetMode === "edit" ? t("carEdit.title") : t("carsPage.dialogTitle")}</SheetTitle>
              <SheetDescription>
                {sheetMode === "edit"
                  ? `${form.make} ${form.model}${form.year ? ` (${form.year})` : ""}`
                  : t("carsPage.dialogDescription")}
              </SheetDescription>
            </div>
            {sheetMode === "create" && (
              <CarDocumentScanner
                onScanComplete={handleScanComplete}
                carColors={carColors}
                t={t}
              />
            )}
          </div>
        </SheetHeader>
        {sheetLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground">{t("common.loading")}</div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <CarFormFields
                form={form}
                setForm={setForm}
                makes={makes}
                models={models}
                carColors={carColors}
                loadModels={loadModels}
                sheetMode={sheetMode}
                t={t}
                locale={locale}
              />
              <CarFormService
                form={form}
                setForm={setForm}
                images={images}
                documents={documents}
                sheetMode={sheetMode}
                onImageChange={onImageChange}
                onDocumentFiles={onDocumentFiles}
                onRemoveDocument={onRemoveDocument}
                docInputRef={docInputRef}
                t={t}
              />
            </div>
            <SheetFooter className="border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? (sheetMode === "edit" ? t("carEdit.saving") : t("carsPage.adding"))
                  : (sheetMode === "edit" ? t("carEdit.saveChanges") : t("carsPage.addCarBtn"))
                }
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
