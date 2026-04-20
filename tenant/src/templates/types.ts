import type { Company, Car, WebsiteSlide, WebsitePage, BlogPost } from "@/lib/types";

export interface TemplateProps {
  company: Company;
  cars: Car[];
  currency: string;
  subdomain: string;
  slides: WebsiteSlide[];
  page?: string;
  pageData?: WebsitePage | null;
  blogPosts?: BlogPost[];
  blogPost?: BlogPost | null;
}
