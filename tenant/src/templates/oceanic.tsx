import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";
import { Waves } from "lucide-react";

export function OceanicTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#1d4ed8";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="dark" accentColor={color} />

      {page === "home" && (
        <>
          {slides.length > 0 ? (
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-gradient-to-b from-blue-950/70 to-sky-900/50" height="min-h-[75vh]" />
          ) : (
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-sky-700 px-6 py-32 text-white">
              <div className="absolute bottom-0 left-0 right-0 opacity-10">
                <svg viewBox="0 0 1440 120" className="w-full"><path fill="white" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L0,120Z" /></svg>
              </div>
              <div className="relative text-center">
                <Waves className="mx-auto mb-4 h-10 w-10 text-sky-300" />
                <h1 className="text-4xl font-bold md:text-6xl">
                  {company.websiteHeroTitle || company.slogan || "Smooth Sailing Ahead"}
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg text-blue-200">
                  {company.websiteHeroSubtitle || "Navigate your journey with our premium fleet"}
                </p>
                <a href="#cars" className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-blue-800 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
                  Explore Fleet
                </a>
              </div>
            </section>
          )}
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Our Vehicles</h2>
              <p className="mt-2 text-slate-500">Reliable cars for every destination</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-blue-700" accentHover="hover:bg-blue-800" />
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
