import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";

export function MinimalTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#171717";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="light" accentColor={color} />

      {page === "home" && (
        <>
          {slides.length > 0 ? (
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-black/30" height="min-h-[60vh]" />
          ) : (
            <section className="mx-auto max-w-6xl px-6 pb-16 pt-24">
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {company.websiteHeroTitle || company.slogan || company.name}
              </h1>
              <p className="mt-3 text-lg text-neutral-500">
                {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} available for rent
              </p>
            </section>
          )}
          <div className="mx-auto max-w-6xl px-6"><div className="h-px bg-neutral-200" /></div>
          <section id="cars" className="mx-auto max-w-6xl px-6 py-16">
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-neutral-900" accentHover="hover:bg-neutral-800" cardStyle="minimal" />
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
