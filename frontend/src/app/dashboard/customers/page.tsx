"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
import { toast } from "sonner";
import { DatePicker } from "@/components/date-picker";
import { DataTable, Eye, Pencil, Trash2 } from "@/components/data-table";
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

interface DocumentItem {
  id?: number;
  tempId?: string;
  url: string;
  documentType: "id_card" | "drivers_license" | "passport" | "other";
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  personalNumber: string;
  driversLicense: string;
  driversLicenseExpiry: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  createdAt: string;
  documents?: DocumentItem[];
}

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

/** Normalize a string for fuzzy matching (strip diacritics, lowercase) */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Find the best matching option from a list given an AI-extracted value */
function fuzzyMatch(value: string, options: string[]): string {
  if (!value) return "";
  const norm = normalize(value);
  // Exact match first
  const exact = options.find((o) => normalize(o) === norm);
  if (exact) return exact;
  // Starts-with match
  const starts = options.find((o) => normalize(o).startsWith(norm) || norm.startsWith(normalize(o)));
  if (starts) return starts;
  // Contains match
  const contains = options.find((o) => normalize(o).includes(norm) || norm.includes(normalize(o)));
  if (contains) return contains;
  return "";
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | "view">("create");
  const [editCustomerId, setEditCustomerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

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

  const fetchCustomers = async () => {
    try {
      const data = await api.get<{ rows: Customer[] }>("/customers");
      setCustomers(data.rows || []);
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Open sheet for creating ──────────────────────────────────
  const openCreateSheet = () => {
    setSheetMode("create");
    setEditCustomerId(null);
    setForm({ ...EMPTY_FORM });
    setDocuments([]);
    setSheetOpen(true);
  };

  // ── Open sheet for editing ───────────────────────────────────
  const openEditSheet = async (customer: Customer) => {
    setSheetMode("edit");
    setEditCustomerId(customer.id);
    setSheetOpen(true);
    try {
      const detail = await api.get<Customer>(`/customers/${customer.id}`);
      setForm({
        firstName: detail.firstName || "",
        lastName: detail.lastName || "",
        email: detail.email || "",
        phone: detail.phone || "",
        idNumber: detail.idNumber || "",
        personalNumber: detail.personalNumber || "",
        driversLicense: detail.driversLicense || "",
        driversLicenseExpiry: detail.driversLicenseExpiry || "",
        dateOfBirth: detail.dateOfBirth || "",
        address: detail.address || "",
        city: detail.city || "",
        country: detail.country || "",
        notes: detail.notes || "",
      });
      setDocuments(detail.documents || []);
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
      setSheetOpen(false);
    }
  };

  // ── Open sheet for viewing ───────────────────────────────────
  const openViewSheet = async (customer: Customer) => {
    setSheetMode("view");
    setEditCustomerId(customer.id);
    setSheetOpen(true);
    try {
      const detail = await api.get<Customer>(`/customers/${customer.id}`);
      setForm({
        firstName: detail.firstName || "",
        lastName: detail.lastName || "",
        email: detail.email || "",
        phone: detail.phone || "",
        idNumber: detail.idNumber || "",
        personalNumber: detail.personalNumber || "",
        driversLicense: detail.driversLicense || "",
        driversLicenseExpiry: detail.driversLicenseExpiry || "",
        dateOfBirth: detail.dateOfBirth || "",
        address: detail.address || "",
        city: detail.city || "",
        country: detail.country || "",
        notes: detail.notes || "",
      });
      setDocuments(detail.documents || []);
    } catch {
      toast.error(t("customersPage.toast.failedLoad"));
      setSheetOpen(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone) {
      toast.error(t("customersPage.validation.required"));
      return;
    }
    setSaving(true);
    try {
      await api.post("/customers", { ...form, documents });
      toast.success(t("customersPage.toast.created"));
      setForm({ ...EMPTY_FORM });
      setDocuments([]);
      setSheetOpen(false);
      fetchCustomers();
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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !editCustomerId) {
      toast.error(t("customersPage.validation.required"));
      return;
    }
    setSaving(true);
    try {
      await api.put(`/customers/${editCustomerId}`, { ...form, documents });
      toast.success(t("customersPage.toast.updated"));
      setSheetOpen(false);
      fetchCustomers();
    } catch {
      toast.error(t("customersPage.toast.failedUpdate"));
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

      // Auto-extract with AI if in create/edit mode
      if (sheetMode !== "view") {
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
            // Match country first so we can get the right cities list
            const countryNames = COUNTRIES.map((c) => c.name);
            const matchedCountry = prev.country || fuzzyMatch(extracted.country || "", countryNames);
            const countryObj = COUNTRIES.find((c) => c.name === matchedCountry);
            const matchedCity = prev.city || fuzzyMatch(extracted.city || "", countryObj?.cities ?? []);

            return {
              ...prev,
              firstName: prev.firstName || extracted.firstName || "",
              lastName: prev.lastName || extracted.lastName || "",
              email: prev.email || extracted.email || "",
              phone: prev.phone || extracted.phone || "",
              idNumber: prev.idNumber || extracted.idNumber || "",
              personalNumber: prev.personalNumber || extracted.personalNumber || "",
              driversLicense: prev.driversLicense || extracted.driversLicense || "",
              driversLicenseExpiry: prev.driversLicenseExpiry || extracted.driversLicenseExpiry || "",
              dateOfBirth: prev.dateOfBirth || extracted.dateOfBirth || "",
              address: prev.address || extracted.address || "",
              country: matchedCountry,
              city: matchedCity,
            };
          });

          // Tag document types from AI
          if (extracted.documentTypes && Array.isArray(extracted.documentTypes)) {
            setDocuments((prev) =>
              prev.map((doc) => {
                if (newDocs.some((nd) => nd.tempId === doc.tempId)) {
                  const aiType = extracted.documentTypes?.find((dt) =>
                    ["id_card", "drivers_license", "passport"].includes(dt)
                  );
                  return aiType
                    ? { ...doc, documentType: aiType as DocumentItem["documentType"] }
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
            // Remove the docs that were just uploaded since AI can't use them
            setDocuments((prev) =>
              prev.filter((d) => !newDocs.some((nd) => nd.tempId === d.tempId))
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
    [documents, sheetMode, t]
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

  const isDisabled = sheetMode === "view";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">{t("customersPage.loadingCustomers")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("customersPage.title")}</h1>
          <p className="text-muted-foreground">
            {t("customersPage.subtitle", { count: String(customers.length) })}
          </p>
        </div>
        <Button onClick={openCreateSheet}>{t("customersPage.newCustomer")}</Button>
      </div>

      {/* ── Shared Create / Edit / View Sheet ────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
          <SheetHeader className="border-b">
            <SheetTitle>
              {sheetMode === "edit"
                ? t("customersPage.editTitle")
                : sheetMode === "view"
                  ? t("customersPage.viewTitle")
                  : t("customersPage.dialogTitle")}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === "edit" || sheetMode === "view"
                ? `${form.firstName} ${form.lastName}`
                : t("customersPage.dialogDescription")}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={sheetMode === "edit" ? handleEdit : handleCreate} className="flex flex-1 flex-col overflow-hidden">
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
                      <div key={doc.id || doc.tempId || idx} className="group relative">
                        <img
                          src={doc.url}
                          alt={docTypeLabel(doc.documentType)}
                          className="h-20 w-16 rounded-md border object-cover"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] px-1 py-0"
                        >
                          {docTypeLabel(doc.documentType)}
                        </Badge>
                        {!isDisabled && (
                          <button
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {!isDisabled && (
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
                )}

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
                  disabled={isDisabled || extracting}
                />

                {!isDisabled && documents.length === 0 && (
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
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} disabled={isDisabled || extracting} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.lastName")} *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} disabled={isDisabled || extracting} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.email")}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isDisabled || extracting} />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.phone")} *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={isDisabled || extracting} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.idNumber")}</Label>
                  <Input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} disabled={isDisabled || extracting} />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.personalNumber")}</Label>
                  <Input value={form.personalNumber} onChange={(e) => setForm({ ...form, personalNumber: e.target.value })} disabled={isDisabled || extracting} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("customersPage.dateOfBirth")}</Label>
                  <DatePicker value={form.dateOfBirth} onChange={(val) => setForm({ ...form, dateOfBirth: val })} maxDate={new Date()} disabled={isDisabled || extracting} />
                </div>
                <div className="space-y-2">
                  <Label>{t("customersPage.address")}</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={isDisabled || extracting} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Country combobox */}
                <div className="space-y-2">
                  <Label>{t("customersPage.country")}</Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger
                      disabled={isDisabled || extracting}
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
                        <span className={form.country ? "" : "text-muted-foreground"}>
                          {form.country || t("customersPage.selectCountry")}
                        </span>
                      </div>
                      <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-(--anchor-width) p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("customersPage.searchCountry")} />
                        <CommandList>
                          <CommandEmpty>{t("customersPage.noCountryFound")}</CommandEmpty>
                          <CommandGroup>
                            {COUNTRIES.map((c) => (
                              <CommandItem
                                key={c.code}
                                value={c.name}
                                onSelect={() => {
                                  setForm((prev) => ({ ...prev, country: c.name, city: "" }));
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
                      disabled={isDisabled || extracting || !form.country}
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
                        <span className={form.city ? "" : "text-muted-foreground"}>
                          {form.city || (form.country ? t("customersPage.selectCity") : t("customersPage.selectCountryFirst"))}
                        </span>
                      </div>
                      <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent className="w-(--anchor-width) p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("customersPage.searchCity")} />
                        <CommandList>
                          <CommandEmpty>{t("customersPage.noCityFound")}</CommandEmpty>
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
            {sheetMode !== "view" ? (
              <SheetFooter className="border-t">
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={saving || extracting}>
                  {saving
                    ? (sheetMode === "edit" ? t("common.saving") : t("customersPage.creating"))
                    : (sheetMode === "edit" ? t("common.save") : t("customersPage.createCustomer"))}
                </Button>
              </SheetFooter>
            ) : (
              <SheetFooter className="border-t">
                <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>{t("common.close")}</Button>
                <Button type="button" onClick={() => setSheetMode("edit")}>{t("common.edit")}</Button>
              </SheetFooter>
            )}
          </form>
        </SheetContent>
      </Sheet>

      <DataTable<Customer>
        data={customers}
        columns={[
          {
            key: "name",
            header: t("customersPage.tableHeaders.name"),
            sortValue: (c) => `${c.firstName} ${c.lastName}`,
            render: (c) => <span className="font-medium">{c.firstName} {c.lastName}</span>,
          },
          {
            key: "phone",
            header: t("customersPage.tableHeaders.phone"),
            sortValue: (c) => c.phone,
            render: (c) => <span>{c.phone}</span>,
          },
          {
            key: "email",
            header: t("customersPage.tableHeaders.email"),
            sortValue: (c) => c.email || "",
            render: (c) => <span className="text-muted-foreground">{c.email || "—"}</span>,
          },
          {
            key: "idLicense",
            header: t("customersPage.tableHeaders.idLicense"),
            sortable: false,
            render: (c) => (
              <div className="flex flex-wrap gap-1">
                {c.idNumber && <Badge variant="outline" className="text-xs">ID: {c.idNumber}</Badge>}
                {c.personalNumber && <Badge variant="outline" className="text-xs">PN: {c.personalNumber}</Badge>}
                {c.driversLicense && <Badge variant="outline" className="text-xs">DL: {c.driversLicense}</Badge>}
                {!c.idNumber && !c.personalNumber && !c.driversLicense && <span className="text-muted-foreground">—</span>}
              </div>
            ),
          },
          {
            key: "registered",
            header: t("customersPage.tableHeaders.registered"),
            sortValue: (c) => new Date(c.createdAt).getTime(),
            render: (c) => (
              <span className="text-sm text-muted-foreground">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        getRowId={(c) => c.id}
        searchFn={(c, q) =>
          `${c.firstName} ${c.lastName} ${c.phone} ${c.email} ${c.idNumber} ${c.personalNumber}`.toLowerCase().includes(q)
        }
        actions={[
          {
            label: t("common.view"),
            icon: <Eye className="h-4 w-4" />,
            onClick: (c) => openViewSheet(c),
          },
          {
            label: t("common.edit"),
            icon: <Pencil className="h-4 w-4" />,
            onClick: (c) => openEditSheet(c),
          },
          {
            label: t("common.delete"),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: async (c) => {
              if (!confirm(t("common.confirmDelete"))) return;
              try {
                await api.delete(`/customers/${c.id}`);
                toast.success(t("common.deleted"));
                fetchCustomers();
              } catch {
                toast.error(t("common.failedDelete"));
              }
            },
            variant: "destructive",
          },
        ]}
        emptyMessage={t("customersPage.emptyState")}
        defaultSortKey="name"
        onRowClick={(c) => openViewSheet(c)}
      />
    </div>
  );
}
