import type { CompanySettings, CompanyForm } from "../types";

export interface DeliveryPoint {
  id: number;
  name: string;
  address: string | null;
  isActive: boolean;
}

export interface InsuranceProvider {
  id: number;
  name: string;
  isActive: boolean;
}

export interface CompanyInfoFieldsProps {
  company: CompanySettings;
  form: CompanyForm;
  updateField: (field: keyof CompanyForm, value: string) => void;
}

export interface CompanyBrandingProps {
  form: CompanyForm;
  updateField: (field: keyof CompanyForm, value: string) => void;
}

export interface DeliveryPointsSectionProps {
  deliveryPoints: DeliveryPoint[];
  dpLoading: boolean;
  showAddDp: boolean;
  setShowAddDp: (v: boolean) => void;
  newDpName: string;
  setNewDpName: (v: string) => void;
  newDpAddress: string;
  setNewDpAddress: (v: string) => void;
  addingDp: boolean;
  handleAddDp: () => void;
  editingDpId: number | null;
  editDpName: string;
  setEditDpName: (v: string) => void;
  editDpAddress: string;
  setEditDpAddress: (v: string) => void;
  handleUpdateDp: (id: number) => void;
  handleDeleteDp: (id: number) => void;
  startEditDp: (point: DeliveryPoint) => void;
  setEditingDpId: (id: number | null) => void;
}
