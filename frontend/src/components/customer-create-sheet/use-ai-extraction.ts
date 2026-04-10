"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/compress-image";
import { COUNTRIES } from "@/lib/country-data";
import { toast } from "sonner";
import { fuzzyMatch, type DocumentItem, type CustomerForm } from "./types";

interface UseAiExtractionOptions {
  documents: DocumentItem[];
  setDocuments: Dispatch<SetStateAction<DocumentItem[]>>;
  setForm: Dispatch<SetStateAction<CustomerForm>>;
  extracting: boolean;
  setExtracting: Dispatch<SetStateAction<boolean>>;
}

export function useAiExtraction({
  documents,
  setDocuments,
  setForm,
  setExtracting,
}: UseAiExtractionOptions) {
  const { t } = useTranslation();

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

      // Auto-extract with AI
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

        // Only fill empty fields — with smart country/city matching
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

        // Tag document types from AI
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
                      documentType:
                        aiType as DocumentItem["documentType"],
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
    },
    [documents, t, setDocuments, setForm, setExtracting]
  );

  return { handleDocumentUpload };
}
