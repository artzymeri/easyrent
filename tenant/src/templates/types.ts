import type { Company, Car } from "@/lib/types";

export interface TemplateProps {
  company: Company;
  cars: Car[];
  currency: string;
}
