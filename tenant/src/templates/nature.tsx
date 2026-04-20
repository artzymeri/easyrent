import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";
import { Leaf } from "lucide-react";

export function NatureTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#059669";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="dark" accentColor={color} />

      {page === "home" && (
        <>
          {slides.length > 0 ? (
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-gradient-to-br from-emerald-950/60 to-stone-900/40" />
          ) : (
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 px-6 py-28 text-white">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
              <div className="relative text-center">
                <Leaf className="mx-auto mb-4 h-10 w-10 text-emerald-200" />
                <h1 className="text-4xl font-bold md:text-6xl">
                  {company.websiteHeroTitle || company.slogan || "Drive Naturally"}
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
                  {company.websiteHeroSubtitle || "Eco-friendly rides for conscious travelers"}
                </p>
                <a href="#cars" className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow-lg hover:shadow-xl transition-all">
                  View Cars
                </a>
              </div>
            </section>
          )}
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Our Collection</h2>
              <p className="mt-2 text-stone-500">Handpicked vehicles for your comfort</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-emerald-600" accentHover="hover:bg-emerald-700" />
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
