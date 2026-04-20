import type { Company, Car, BookedRange, BookingRequestPayload, WebsiteSlide, WebsitePage, BlogPost } from "./types";

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

export async function getBookedDates(subdomain: string, carId: number): Promise<{ bookedRanges: BookedRange[]; dailyRate: number }> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/cars/${carId}/booked-dates`, {
      cache: "no-store",
    });
    if (!res.ok) return { bookedRanges: [], dailyRate: 0 };
    return res.json();
  } catch {
    return { bookedRanges: [], dailyRate: 0 };
  }
}

export async function submitBookingRequest(subdomain: string, data: BookingRequestPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/booking-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error || "Failed to submit request" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function getSlides(subdomain: string): Promise<WebsiteSlide[]> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/slides`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPage(subdomain: string, slug: string): Promise<WebsitePage | null> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/pages/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getBlogPosts(subdomain: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/blog`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getBlogPost(subdomain: string, slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/public/${subdomain}/blog/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
