"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  EMPTY_FORM,
  type CustomerCreateSheetProps,
  type CreatedCustomer,
  type CustomerPrefill,
  type DocumentItem,
  type CustomerForm,
} from "./types";
import { DocumentUpload } from "./document-upload";
import { CustomerFields } from "./customer-fields";
import { useAiExtraction } from "./use-ai-extraction";

export type { CustomerPrefill, CreatedCustomer };

export function CustomerCreateSheet({
  open,
  onOpenChange,
  onCreated,
  prefill,
}: CustomerCreateSheetProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<CustomerForm>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Document upload state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [extracting, setExtracting] = useState(false);

  const { handleDocumentUpload } = useAiExtraction({
    documents,
    setDocuments,
    setForm,
    extracting,
    setExtracting,
  });

  // Reset form when sheet opens — apply prefill if provided
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setForm({
        ...EMPTY_FORM,
        firstName: prefill?.firstName || "",
        lastName: prefill?.lastName || "",
        email: prefill?.email || "",
        phone: prefill?.phone || "",
      });
      setDocuments([]);
      setExtracting(false);
    }
    onOpenChange(isOpen);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) {
      toast.error(t("customersPage.validation.required"));
      return;
    }
    setSaving(true);
    try {
      const created = await api.post<CreatedCustomer>("/customers", {
        ...form,
        documents,
      });
      toast.success(t("customersPage.toast.created"));
      onCreated(created);
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already exists")) {
        toast.error(t("customersPage.toast.alreadyExists"));
      } else {
        toast.error(t("customersPage.toast.failedCreate"));
      }
    } finally {
      setSaving(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle>{t("customersPage.dialogTitle")}</SheetTitle>
          <SheetDescription>
            {t("customersPage.dialogDescription")}
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={handleCreate}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <DocumentUpload
              documents={documents}
              extracting={extracting}
              onUpload={handleDocumentUpload}
              onRemove={removeDocument}
            />
            <CustomerFields
              form={form}
              setForm={setForm}
              extracting={extracting}
            />
          </div>
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
                ? t("customersPage.creating")
                : t("customersPage.createCustomer")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
