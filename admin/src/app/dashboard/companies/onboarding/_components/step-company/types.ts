import type { CompanyData, SubdomainStatus } from "../../types";

export interface StepCompanyProps {
  company: CompanyData;
  setCompany: React.Dispatch<React.SetStateAction<CompanyData>>;
  subdomainStatus: SubdomainStatus;
  loading: boolean;
  onSubmit: () => void;
}

export type UpdateFn = (field: keyof CompanyData, value: string) => void;

export interface SectionProps {
  company: CompanyData;
  update: UpdateFn;
}
