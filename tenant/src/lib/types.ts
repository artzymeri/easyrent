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
