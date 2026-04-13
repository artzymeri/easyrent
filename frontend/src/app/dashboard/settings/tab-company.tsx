"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CompanySettings, CompanyForm } from "./types";
import type { DeliveryPoint, InsuranceProvider } from "./_components/company-types";
import { CompanyInfoFields } from "./_components/company-info-fields";
import { CompanyBranding } from "./_components/company-branding";
import { DeliveryPointsSection } from "./_components/delivery-points-section";
import { InsuranceProvidersSection, formatInsuranceName } from "./_components/insurance-providers-section";

interface TabCompanyProps {
  company: CompanySettings;
  onCompanyUpdate: (company: CompanySettings) => void;
  initialForm: CompanyForm;
}

export function TabCompany({ company, onCompanyUpdate, initialForm }: TabCompanyProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<CompanyForm>(initialForm);
  const [saving, setSaving] = useState(false);

  // Delivery points state
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [dpLoading, setDpLoading] = useState(true);
  const [newDpName, setNewDpName] = useState("");
  const [newDpAddress, setNewDpAddress] = useState("");
  const [addingDp, setAddingDp] = useState(false);
  const [showAddDp, setShowAddDp] = useState(false);
  const [editingDpId, setEditingDpId] = useState<number | null>(null);
  const [editDpName, setEditDpName] = useState("");
  const [editDpAddress, setEditDpAddress] = useState("");

  // Insurance providers state
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [ipLoading, setIpLoading] = useState(true);
  const [newIpName, setNewIpName] = useState("");
  const [addingIp, setAddingIp] = useState(false);
  const [showAddIp, setShowAddIp] = useState(false);
  const [editingIpId, setEditingIpId] = useState<number | null>(null);
  const [editIpName, setEditIpName] = useState("");

  useEffect(() => {
    fetchDeliveryPoints();
    fetchInsuranceProviders();
  }, []);

  const fetchDeliveryPoints = async () => {
    try {
      const data = await api.get<DeliveryPoint[]>("/delivery-points");
      setDeliveryPoints(data);
    } catch {
      toast.error(t("settings.failedDeliveryPoints"));
    } finally {
      setDpLoading(false);
    }
  };

  const handleAddDp = async () => {
    if (!newDpName.trim()) return;
    setAddingDp(true);
    try {
      const point = await api.post<DeliveryPoint>("/delivery-points", {
        name: newDpName.trim(),
        address: newDpAddress.trim() || null,
      });
      setDeliveryPoints((prev) => [...prev, point].sort((a, b) => a.name.localeCompare(b.name)));
      setNewDpName("");
      setNewDpAddress("");
      setShowAddDp(false);
      toast.success(t("settings.deliveryPointAdded"));
    } catch {
      toast.error(t("settings.failedAddDeliveryPoint"));
    } finally {
      setAddingDp(false);
    }
  };

  const handleUpdateDp = async (id: number) => {
    if (!editDpName.trim()) return;
    try {
      const updated = await api.put<DeliveryPoint>(`/delivery-points/${id}`, {
        name: editDpName.trim(),
        address: editDpAddress.trim() || null,
      });
      setDeliveryPoints((prev) =>
        prev.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingDpId(null);
      toast.success(t("settings.deliveryPointUpdated"));
    } catch {
      toast.error(t("settings.failedUpdateDeliveryPoint"));
    }
  };

  const handleDeleteDp = async (id: number) => {
    try {
      await api.delete(`/delivery-points/${id}`);
      setDeliveryPoints((prev) => prev.filter((p) => p.id !== id));
      toast.success(t("settings.deliveryPointDeleted"));
    } catch {
      toast.error(t("settings.failedDeleteDeliveryPoint"));
    }
  };

  const startEditDp = (point: DeliveryPoint) => {
    setEditingDpId(point.id);
    setEditDpName(point.name);
    setEditDpAddress(point.address || "");
  };

  // ── Insurance providers ──────────────────────────────────────
  const fetchInsuranceProviders = async () => {
    try {
      const data = await api.get<InsuranceProvider[]>("/insurance-providers");
      setInsuranceProviders(data);
    } catch {
      toast.error(t("settings.failedInsuranceProviders"));
    } finally {
      setIpLoading(false);
    }
  };

  const handleAddIp = async () => {
    if (!newIpName.trim()) return;
    setAddingIp(true);
    try {
      const provider = await api.post<InsuranceProvider>("/insurance-providers", {
        name: newIpName.trim(),
      });
      setInsuranceProviders((prev) => [...prev, provider].sort((a, b) => a.name.localeCompare(b.name)));
      setNewIpName("");
      setShowAddIp(false);
      toast.success(t("settings.insuranceProviderAdded"));
    } catch {
      toast.error(t("settings.failedAddInsuranceProvider"));
    } finally {
      setAddingIp(false);
    }
  };

  const handleUpdateIp = async (id: number) => {
    if (!editIpName.trim()) return;
    try {
      const updated = await api.put<InsuranceProvider>(`/insurance-providers/${id}`, {
        name: editIpName.trim(),
      });
      setInsuranceProviders((prev) =>
        prev.map((p) => (p.id === id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingIpId(null);
      toast.success(t("settings.insuranceProviderUpdated"));
    } catch {
      toast.error(t("settings.failedUpdateInsuranceProvider"));
    }
  };

  const handleDeleteIp = async (id: number) => {
    try {
      await api.delete(`/insurance-providers/${id}`);
      setInsuranceProviders((prev) => prev.filter((p) => p.id !== id));
      toast.success(t("settings.insuranceProviderDeleted"));
    } catch {
      toast.error(t("settings.failedDeleteInsuranceProvider"));
    }
  };

  const startEditIp = (provider: InsuranceProvider) => {
    setEditingIpId(provider.id);
    setEditIpName(formatInsuranceName(provider.name));
  };

  const updateField = (field: keyof CompanyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const data = await api.put<CompanySettings>("/settings", form);
      onCompanyUpdate(data);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-1 pb-4">
        <CompanyInfoFields
          company={company}
          form={form}
          updateField={updateField}
        />

        <CompanyBranding form={form} updateField={updateField} />

        <DeliveryPointsSection
          deliveryPoints={deliveryPoints}
          dpLoading={dpLoading}
          showAddDp={showAddDp}
          setShowAddDp={setShowAddDp}
          newDpName={newDpName}
          setNewDpName={setNewDpName}
          newDpAddress={newDpAddress}
          setNewDpAddress={setNewDpAddress}
          addingDp={addingDp}
          handleAddDp={handleAddDp}
          editingDpId={editingDpId}
          editDpName={editDpName}
          setEditDpName={setEditDpName}
          editDpAddress={editDpAddress}
          setEditDpAddress={setEditDpAddress}
          handleUpdateDp={handleUpdateDp}
          handleDeleteDp={handleDeleteDp}
          startEditDp={startEditDp}
          setEditingDpId={setEditingDpId}
        />

        <InsuranceProvidersSection
          providers={insuranceProviders}
          ipLoading={ipLoading}
          showAddIp={showAddIp}
          setShowAddIp={setShowAddIp}
          newIpName={newIpName}
          setNewIpName={setNewIpName}
          addingIp={addingIp}
          handleAddIp={handleAddIp}
          editingIpId={editingIpId}
          editIpName={editIpName}
          setEditIpName={setEditIpName}
          handleUpdateIp={handleUpdateIp}
          handleDeleteIp={handleDeleteIp}
          startEditIp={startEditIp}
          setEditingIpId={setEditingIpId}
        />
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t bg-background pt-4 pb-2">
        <div className="flex justify-end">
          <Button onClick={handleSaveCompany} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("settings.saveChanges")}
          </Button>
        </div>
      </div>
    </>
  );
}
