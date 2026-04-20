import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";

export function ElegantTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#d97706";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="dark" accentColor={color} />

      {page === "home" && (
        <>
          <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-gradient-to-b from-stone-950/60 via-stone-900/40 to-stone-950/80" height="min-h-[75vh]" />
          <section className="relative px-6 py-4 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-600">Premium Car Rental</p>
            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
          </section>
          <section id="cars" className="mx-auto max-w-7xl px-6 py-16">
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-amber-700" accentHover="hover:bg-amber-800" theme="dark" />
          </section>
        </>
      )}

      {page === "about" && pageData && <div className="pt-16"><AboutSection page={pageData} variant="dark" /></div>}
      {page === "contact" && pageData && <div className="pt-16"><ContactSection company={company} page={pageData} variant="dark" accentColor={color} /></div>}
      {page === "blog" && <div className="pt-16"><BlogList posts={blogPosts || []} subdomain={subdomain} variant="dark" accentColor={color} /></div>}
      {page === "blog-post" && blogPost && <div className="pt-16"><BlogArticle post={blogPost} variant="dark" /></div>}

      <SiteFooter company={company} variant="dark" />
    </div>
  );
}
