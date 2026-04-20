import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";

export function BoldTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#ea580c";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="dark" accentColor={color} />

      {page === "home" && (
        <>
          <div className="relative">
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-orange-950/30" height="min-h-[85vh]" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
          </div>
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Fleet</p>
                <h2 className="mt-2 text-4xl font-black">Choose Your Ride</h2>
              </div>
              <p className="hidden text-sm text-gray-400 md:block">{cars.length} vehicles</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-orange-600" accentHover="hover:bg-orange-700" theme="dark" />
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
