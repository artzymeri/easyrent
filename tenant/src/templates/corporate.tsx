import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";
import { Building2 } from "lucide-react";

export function CorporateTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#4338ca";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="light" accentColor={color} />

      {page === "home" && (
        <>
          {slides.length > 0 ? (
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-indigo-950/60" />
          ) : (
            <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 px-6 py-28 text-white">
              <div className="mx-auto max-w-7xl">
                <div className="grid items-center gap-12 md:grid-cols-2">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
                      <Building2 className="h-4 w-4" /> Professional Fleet Services
                    </div>
                    <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                      {company.websiteHeroTitle || company.slogan || "Business-Class Vehicle Rental"}
                    </h1>
                    <p className="mt-4 max-w-md text-lg text-indigo-200">
                      {company.websiteHeroSubtitle || "Trusted by businesses for reliable, premium vehicle solutions"}
                    </p>
                    <div className="mt-8 flex gap-3">
                      <a href="#cars" className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-800 shadow-lg hover:shadow-xl transition-all">
                        View Fleet
                      </a>
                      {company.phone && (
                        <a href={`tel:${company.phone}`} className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors">
                          Contact Us
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="hidden md:flex justify-end">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                        <p className="text-3xl font-bold">{cars.length}+</p>
                        <p className="mt-1 text-sm text-indigo-200">Vehicles</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                        <p className="text-3xl font-bold">24/7</p>
                        <p className="mt-1 text-sm text-indigo-200">Support</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                        <p className="text-3xl font-bold">100%</p>
                        <p className="mt-1 text-sm text-indigo-200">Insured</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                        <p className="text-3xl font-bold">5★</p>
                        <p className="mt-1 text-sm text-indigo-200">Rated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12">
              <h2 className="text-3xl font-bold">Our Fleet</h2>
              <p className="mt-2 text-gray-500">Professional-grade vehicles for every need</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-indigo-700" accentHover="hover:bg-indigo-800" />
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
