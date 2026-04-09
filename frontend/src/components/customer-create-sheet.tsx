"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { compressImage } from "@/lib/compress-image";
import { COUNTRIES } from "@/lib/country-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import {
  Upload,
  X,
  FileText,
  Sparkles,
  Loader2,
  ChevronDown,
  Check,
  MapPin,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface DocumentItem {
  id?: number;
  tempId?: string;
  url: string;
  documentType: "id_card" | "drivers_license" | "passport" | "other";
}

export interface CreatedCustomer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
}

export interface CustomerPrefill {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface CustomerCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: CreatedCustomer) => void;
  prefill?: CustomerPrefill | null;
}

// ── Helpers ────────────────────────────────────────────────────
const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  idNumber: "",
  personalNumber: "",
  driversLicense: "",
  driversLicenseExpiry: "",
  dateOfBirth: "",
  address: "",
  city: "",
  country: "",
  notes: "",
};

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function fuzzyMatch(value: string, options: string[]): string {
  if (!value) return "";
  const norm = normalize(value);
  const exact = options.find((o) => normalize(o) === norm);
  if (exact) return exact;
  const starts = options.find(
    (o) => normalize(o).startsWith(norm) || norm.startsWith(normalize(o))
  );
  if (starts) return starts;
  const contains = options.find(
    (o) => normalize(o).includes(norm) || norm.includes(normalize(o))
  );
  if (contains) return contains;
  return "";
}

// ── Component ──────────────────────────────────────────────────
export function CustomerCreateSheet({
  open,
  onOpenChange,
  onCreated,
  prefill,
}: CustomerCreateSheetProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Document upload state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [extracting, setExtracting] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Country/City combobox state
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.name === form.country),
    [form.country]
  );
  const cities = selectedCountry?.cities ?? [];

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

  // ── Document upload handler ──────────────────────────────────
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
    [documents, t]
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
            {/* ── Document Upload Section ───────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  {t("customersPage.documents.title")}
                </Label>
                {extracting && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("customersPage.documents.analyzing")}
                  </div>
                )}
              </div>

              {/* Uploaded documents thumbnails */}
              {documents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc, idx) => (
                    <div
                      key={doc.id || doc.tempId || idx}
                      className="group relative"
                    >
                      <img
                        src={doc.url}
                        alt={docTypeLabel(doc.documentType)}
                        className="h-20 w-16 rounded-md border object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1 py-0 text-[10px]"
                      >
                        {docTypeLabel(doc.documentType)}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <div
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                onClick={() => docInputRef.current?.click()}
              >
                {extracting ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
                    {t("customersPage.documents.analyzing")}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    {t("customersPage.documents.upload")}
                  </>
                )}
              </div>

              <input
                ref={docInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleDocumentUpload(e.target.files);
                  e.target.value = "";
                }}
                disabled={extracting}
              />

              {documents.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("customersPage.documents.hint")}
                </p>
              )}
            </div>

            {extracting && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {t("customersPage.documents.aiWorking")}
                </p>
              </div>
            )}

            <Separator />

            {/* ── Customer Fields ────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("customersPage.firstName")} *</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  disabled={extracting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.lastName")} *</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  disabled={extracting}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("customersPage.email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  disabled={extracting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.phone")} *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  disabled={extracting}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("customersPage.idNumber")}</Label>
                <Input
                  value={form.idNumber}
                  onChange={(e) =>
                    setForm({ ...form, idNumber: e.target.value })
                  }
                  disabled={extracting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.personalNumber")}</Label>
                <Input
                  value={form.personalNumber}
                  onChange={(e) =>
                    setForm({ ...form, personalNumber: e.target.value })
                  }
                  disabled={extracting}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("customersPage.driversLicense")}</Label>
                <Input
                  value={form.driversLicense}
                  onChange={(e) =>
                    setForm({ ...form, driversLicense: e.target.value })
                  }
                  disabled={extracting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.driversLicenseExpiry")}</Label>
                <DatePicker
                  value={form.driversLicenseExpiry}
                  onChange={(val) =>
                    setForm({ ...form, driversLicenseExpiry: val })
                  }
                  disabled={extracting}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("customersPage.dateOfBirth")}</Label>
                <DatePicker
                  value={form.dateOfBirth}
                  onChange={(val) => setForm({ ...form, dateOfBirth: val })}
                  maxDate={new Date()}
                  disabled={extracting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("customersPage.address")}</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  disabled={extracting}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Country combobox */}
              <div className="space-y-2">
                <Label>{t("customersPage.country")}</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger
                    disabled={extracting}
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className="w-full justify-between font-normal"
                      />
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span
                        className={
                          form.country ? "" : "text-muted-foreground"
                        }
                      >
                        {form.country || t("customersPage.selectCountry")}
                      </span>
                    </div>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-(--anchor-width) p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder={t("customersPage.searchCountry")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("customersPage.noCountryFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {COUNTRIES.map((c) => (
                            <CommandItem
                              key={c.code}
                              value={c.name}
                              onSelect={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  country: c.name,
                                  city: "",
                                }));
                                setCountryOpen(false);
                              }}
                            >
                              <span className="flex-1">{c.name}</span>
                              {form.country === c.name && (
                                <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* City combobox */}
              <div className="space-y-2">
                <Label>{t("customersPage.city")}</Label>
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                  <PopoverTrigger
                    disabled={extracting || !form.country}
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={cityOpen}
                        className="w-full justify-between font-normal"
                      />
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span
                        className={
                          form.city ? "" : "text-muted-foreground"
                        }
                      >
                        {form.city ||
                          (form.country
                            ? t("customersPage.selectCity")
                            : t("customersPage.selectCountryFirst"))}
                      </span>
                    </div>
                    <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-(--anchor-width) p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder={t("customersPage.searchCity")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("customersPage.noCityFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {cities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={() => {
                                setForm((prev) => ({ ...prev, city }));
                                setCityOpen(false);
                              }}
                            >
                              <span className="flex-1">{city}</span>
                              {form.city === city && (
                                <Check className="ml-2 h-3.5 w-3.5 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
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
