export interface Company {
  id: number;
  name: string;
  subdomain: string;
  logoUrl: string | null;
  slogan: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  websiteTemplate: string;
  heroSlideSource: string;
  websiteNavLinks: string[];
  websitePrimaryColor: string | null;
  websiteHeroTitle: string | null;
  websiteHeroSubtitle: string | null;
}

export interface CarImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Car {
  id: number;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  fuelType: string;
  transmission: string;
  seats: number;
  dailyRate: number;
  mileage: number;
  images: CarImage[];
}

export interface BookedRange {
  start: string;
  end: string;
}

export interface BookingRequestPayload {
  carId: number;
  startDate: string;
  endDate: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
}

export interface WebsiteSlide {
  id: number | string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
}

export interface WebsitePage {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  heroImageUrl: string | null;
  extraData: Record<string, unknown>;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
}
