export interface WebsiteSettings {
  websiteTemplate: string;
  websitePublished: boolean;
  heroSlideSource: string;
  websiteNavLinks: string[];
  websitePrimaryColor: string | null;
  websiteHeroTitle: string | null;
  websiteHeroSubtitle: string | null;
}

export interface WebsiteSlide {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface WebsitePage {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  metaDescription: string | null;
  isPublished: boolean;
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
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Classic", description: "Clean and traditional", preview: "bg-slate-800" },
  { value: "modern", label: "Modern", description: "Bold gradients with violet accents", preview: "bg-violet-600" },
  { value: "elegant", label: "Elegant", description: "Dark luxury with amber tones", preview: "bg-stone-950" },
  { value: "sporty", label: "Sporty", description: "Aggressive dark theme with red", preview: "bg-zinc-950" },
  { value: "minimal", label: "Minimal", description: "Clean, light and simple", preview: "bg-neutral-50" },
  { value: "starter", label: "Starter", description: "Fresh and friendly with teal", preview: "bg-teal-600" },
  { value: "bold", label: "Bold", description: "High contrast with orange punch", preview: "bg-orange-600" },
  { value: "oceanic", label: "Oceanic", description: "Cool blue gradient", preview: "bg-blue-700" },
  { value: "nature", label: "Nature", description: "Earthy greens and warmth", preview: "bg-emerald-700" },
  { value: "corporate", label: "Corporate", description: "Professional indigo tones", preview: "bg-indigo-700" },
] as const;

export const NAV_LINK_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "cars", label: "Cars" },
  { value: "about", label: "About Us" },
  { value: "contact", label: "Contact" },
  { value: "blog", label: "Blog" },
] as const;
