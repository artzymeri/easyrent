"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LogoCropper } from "@/components/logo-cropper";
import { SignaturePad } from "@/components/signature-pad";
import { toast } from "sonner";
import { Users, Car, Globe } from "lucide-react";

import type { Company, StaffMember, CarItem, EditFormState } from "./_components/types";
import { CompanyHeader } from "./_components/company-header";
import { CompanyEditForm } from "./_components/company-edit-form";
import { CompanyOverviewCards } from "./_components/company-overview-cards";
import { CompanyLogoSection } from "./_components/company-logo-section";
import { StaffTab } from "./_components/staff-tab";
import { CarsTab } from "./_components/cars-tab";
import { WebsiteTab } from "./_components/website-tab";
import { CompanyInfoCard } from "./_components/company-info-card";

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [stampCropperOpen, setStampCropperOpen] = useState(false);

  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    isActive: true,
    slogan: "",
    signature: "",
    stampUrl: "",
    businessNumber: "",
    businessFaxNumber: "",
    companyIdNumber: "",
  });

  const resetEditForm = useCallback(
    (data: Company) => ({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      country: data.country || "",
      isActive: data.isActive,
      slogan: data.slogan || "",
      signature: data.signature || "",
      stampUrl: data.stampUrl || "",
      businessNumber: data.businessNumber || "",
      businessFaxNumber: data.businessFaxNumber || "",
      companyIdNumber: data.companyIdNumber || "",
    }),
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const data = await api.get<Company>(`/companies/${id}`);
      setCompany(data);
      setStaff(data.staff || []);
      setCars(data.cars || []);
      setEditForm(resetEditForm(data));
    } catch {
      toast.error("Failed to load company");
      router.push("/dashboard/companies");
    } finally {
      setLoading(false);
    }
  }, [id, router, resetEditForm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!loading && company && searchParams.get("edit") === "true") {
      setEditing(true);
    }
  }, [loading, company, searchParams]);

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const updated = await api.put<Company>(`/companies/${id}`, editForm);
      setCompany({ ...company, ...updated });
      setEditing(false);
      toast.success("Company updated successfully");
    } catch {
      toast.error("Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/companies/${id}`);
      toast.success("Company deleted successfully");
      router.push("/dashboard/companies");
    } catch {
      toast.error("Failed to delete company");
      setDeleting(false);
    }
  };

  const handleLogoSave = async (base64: string) => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { logoUrl: base64 });
      setCompany({ ...company, logoUrl: base64 });
      toast.success("Logo updated successfully");
    } catch {
      toast.error("Failed to update logo");
    }
  };

  const handleRemoveLogo = async () => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { logoUrl: null });
      setCompany({ ...company, logoUrl: null });
      toast.success("Logo removed");
    } catch {
      toast.error("Failed to remove logo");
    }
  };

  const toggleCompanyStatus = async () => {
    if (!company) return;
    try {
      await api.put(`/companies/${id}`, { isActive: !company.isActive });
      setCompany({ ...company, isActive: !company.isActive });
      setEditForm((f) => ({ ...f, isActive: !company.isActive }));
      toast.success(
        company.isActive ? "Company deactivated" : "Company activated"
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCancelEdit = () => {
    if (!company) return;
    setEditing(false);
    setEditForm(resetEditForm(company));
  };

  const handleCompanyUpdate = (updates: Partial<Company>) => {
    if (!company) return;
    setCompany({ ...company, ...updates });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6">
      <CompanyHeader
        company={company}
        editing={editing}
        saving={saving}
        deleting={deleting}
        editForm={editForm}
        onBack={() => router.push("/dashboard/companies")}
        onEdit={() => setEditing(true)}
        onCancelEdit={handleCancelEdit}
        onSave={handleSave}
        onDelete={handleDelete}
        onToggleStatus={toggleCompanyStatus}
        onOpenLogoCropper={() => setLogoCropperOpen(true)}
      />

      {editing ? (
        <CompanyEditForm
          editForm={editForm}
          setEditForm={setEditForm}
          onOpenStampCropper={() => setStampCropperOpen(true)}
          onOpenSignaturePad={() => setSignaturePadOpen(true)}
        />
      ) : (
        <>
          <CompanyOverviewCards company={company} staff={staff} cars={cars} />
        </>
      )}

      {!editing && (
        <CompanyLogoSection
          company={company}
          onOpenLogoCropper={() => setLogoCropperOpen(true)}
          onRemoveLogo={handleRemoveLogo}
        />
      )}

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            Staff ({staff.length})
          </TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="mr-1.5 h-3.5 w-3.5" />
            Cars ({cars.length})
          </TabsTrigger>
          <TabsTrigger value="website">
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            Website
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <StaffTab staff={staff} />
        </TabsContent>

        <TabsContent value="cars">
          <CarsTab cars={cars} currency={company.currency} />
        </TabsContent>

        <TabsContent value="website">
          <WebsiteTab
            company={company}
            companyId={id}
            onCompanyUpdate={handleCompanyUpdate}
          />
        </TabsContent>
      </Tabs>

      <CompanyInfoCard company={company} />

      <LogoCropper
        open={logoCropperOpen}
        onOpenChange={setLogoCropperOpen}
        onSave={handleLogoSave}
      />
      <LogoCropper
        open={stampCropperOpen}
        onOpenChange={setStampCropperOpen}
        onSave={(base64) => {
          setEditForm((f) => ({ ...f, stampUrl: base64 }));
          setStampCropperOpen(false);
        }}
      />
      <SignaturePad
        open={signaturePadOpen}
        onOpenChange={setSignaturePadOpen}
        onSave={(base64) => setEditForm((f) => ({ ...f, signature: base64 }))}
        existingSignature={editForm.signature || null}
      />
    </div>
  );
}
