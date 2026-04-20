import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";

const ACCENT = "#2563eb";

export function ClassicTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || ACCENT;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="dark" accentColor={color} />

      {page === "home" && (
        <>
          <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-gradient-to-br from-slate-900/70 to-slate-800/50" />
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Our Fleet</h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full" style={{ backgroundColor: color }} />
              <p className="mt-4 text-gray-500">Browse our selection of quality vehicles</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-blue-600" accentHover="hover:bg-blue-700" />
          </section>
        </>
      )}

      {page === "about" && pageData && <div className="pt-16"><AboutSection page={pageData} /></div>}
      {page === "contact" && pageData && <div className="pt-16"><ContactSection company={company} page={pageData} accentColor={color} /></div>}
      {page === "blog" && <div className="pt-16"><BlogList posts={blogPosts || []} subdomain={subdomain} accentColor={color} /></div>}
      {page === "blog-post" && blogPost && <div className="pt-16"><BlogArticle post={blogPost} /></div>}

      <SiteFooter company={company} />
    </div>
  );
}
