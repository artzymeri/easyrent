"use client";

import { useRef, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/compress-image";
import { COUNTRIES } from "@/lib/country-data";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { CustomerForm, DocumentItem } from "./types";
import { fuzzyMatch } from "./types";
import { CustomerFields } from "./customer-fields";
import { DocumentUploadSection } from "./document-upload-section";

interface CustomerFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "view";
  form: CustomerForm;
  setForm: React.Dispatch<React.SetStateAction<CustomerForm>>;
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  extracting: boolean;
  setExtracting: (v: boolean) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToEdit: () => void;
}

export function CustomerFormSheet({
  open,
  onOpenChange,
  mode,
  form,
  setForm,
  documents,
  setDocuments,
  extracting,
  setExtracting,
  saving,
  onSubmit,
  onSwitchToEdit,
}: CustomerFormSheetProps) {
  const { t } = useTranslation();
  const docInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.name === form.country),
    [form.country]
  );
  const cities = selectedCountry?.cities ?? [];

  const isDisabled = mode === "view";

  const handleDocumentUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const maxDocs = 10;
      const remaining = maxDocs - documents.length;
      if (remaining <= 0) {
        toast.error(t("customersPage.documents.maxReached"));
        return;
      }

      const fileArray = Array.from(files)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, remaining);

      if (fileArray.length === 0) return;

      const newDocs: DocumentItem[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const compressed = await compressImage(fileArray[i], 1600, 1600, 0.85);
        newDocs.push({
          tempId: `new-${Date.now()}-${i}`,
          url: compressed,
          documentType: "other",
        });
      }

      const updatedDocs = [...documents, ...newDocs];
      setDocuments(updatedDocs);

      if (mode !== "view") {
        setExtracting(true);
        try {
          const extracted = await api.post<{
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            phone?: string | null;
            idNumber?: string | null;
            personalNumber?: string | null;
            driversLicense?: string | null;
            driversLicenseExpiry?: string | null;
            dateOfBirth?: string | null;
            address?: string | null;
            city?: string | null;
            country?: string | null;
            documentTypes?: string[];
          }>("/customers/extract-from-documents", {
            images: newDocs.map((d) => d.url),
          });

          setForm((prev) => {
            const countryNames = COUNTRIES.map((c) => c.name);
            const matchedCountry =
              prev.country || fuzzyMatch(extracted.country || "", countryNames);
            const countryObj = COUNTRIES.find((c) => c.name === matchedCountry);
            const matchedCity =
              prev.city ||
              fuzzyMatch(extracted.city || "", countryObj?.cities ?? []);

            return {
              ...prev,
              firstName: prev.firstName || extracted.firstName || "",
              lastName: prev.lastName || extracted.lastName || "",
              email: prev.email || extracted.email || "",
              phone: prev.phone || extracted.phone || "",
              idNumber: prev.idNumber || extracted.idNumber || "",
              personalNumber:
                prev.personalNumber || extracted.personalNumber || "",
              driversLicense:
                prev.driversLicense || extracted.driversLicense || "",
              driversLicenseExpiry:
                prev.driversLicenseExpiry ||
                extracted.driversLicenseExpiry ||
                "",
              dateOfBirth: prev.dateOfBirth || extracted.dateOfBirth || "",
              address: prev.address || extracted.address || "",
              country: matchedCountry,
              city: matchedCity,
            };
          });

          if (
            extracted.documentTypes &&
            Array.isArray(extracted.documentTypes)
          ) {
            setDocuments((prev) =>
              prev.map((doc) => {
                if (newDocs.some((nd) => nd.tempId === doc.tempId)) {
                  const aiType = extracted.documentTypes?.find((dt) =>
                    ["id_card", "drivers_license", "passport"].includes(dt)
                  );
                  return aiType
                    ? {
                        ...doc,
                        documentType: aiType as DocumentItem["documentType"],
                      }
                    : doc;
                }
                return doc;
              })
            );
          }

          toast.success(t("customersPage.documents.extracted"));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "";
          if (msg.includes("unusable_document")) {
            setDocuments((prev) =>
              prev.filter(
                (d) => !newDocs.some((nd) => nd.tempId === d.tempId)
              )
            );
            toast.error(t("customersPage.documents.unusable"));
          } else {
            toast.error(t("customersPage.documents.extractionFailed"));
          }
        } finally {
          setExtracting(false);
        }
      }
    },
    [documents, mode, t, setForm, setDocuments, setExtracting]
  );

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const docTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      id_card: t("customersPage.documents.types.idCard"),
      drivers_license: t("customersPage.documents.types.driversLicense"),
      passport: t("customersPage.documents.types.passport"),
      other: t("customersPage.documents.types.other"),
    };
    return labels[type] || type;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>
            {mode === "edit"
              ? t("customersPage.editTitle")
              : mode === "view"
                ? t("customersPage.viewTitle")
                : t("customersPage.dialogTitle")}
          </SheetTitle>
          <SheetDescription>
            {mode === "edit" || mode === "view"
              ? `${form.firstName} ${form.lastName}`
              : t("customersPage.dialogDescription")}
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Document Upload Section */}
            <DocumentUploadSection
              documents={documents}
              extracting={extracting}
              isDisabled={isDisabled}
              docInputRef={docInputRef}
              onUpload={handleDocumentUpload}
              onRemove={removeDocument}
              docTypeLabel={docTypeLabel}
            />

            {extracting && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {t("customersPage.documents.aiWorking")}
                </p>
              </div>
            )}

            <Separator />

            {/* Customer Fields */}
            <CustomerFields
              form={form}
              setForm={setForm}
              cities={cities}
              disabled={isDisabled || extracting}
            />
          </div>
          {mode !== "view" ? (
            <SheetFooter className="border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saving || extracting}>
                {saving
                  ? mode === "edit"
                    ? t("common.saving")
                    : t("customersPage.creating")
                  : mode === "edit"
                    ? t("common.save")
                    : t("customersPage.createCustomer")}
              </Button>
            </SheetFooter>
          ) : (
            <SheetFooter className="border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common.close")}
              </Button>
              <Button type="button" onClick={onSwitchToEdit}>
                {t("common.edit")}
              </Button>
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
