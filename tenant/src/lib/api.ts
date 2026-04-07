import type { Company, Car } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4344/api";

export async function getCompany(subdomain: string): Promise<Company | null> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getCars(subdomain: string): Promise<{ rows: Car[]; currency: string }> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/cars`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { rows: [], currency: "EUR" };
    return res.json();
  } catch {
    return { rows: [], currency: "EUR" };
  }
}
