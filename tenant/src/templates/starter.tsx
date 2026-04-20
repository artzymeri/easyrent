import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";
import { Sparkles } from "lucide-react";

export function StarterTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#0d9488";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white text-gray-900">
      <SiteNav company={company} subdomain={subdomain} page={page} variant="light" accentColor={color} />

      {page === "home" && (
        <>
          {slides.length > 0 ? (
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-teal-950/50" />
          ) : (
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 px-6 py-28 text-center text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_60%)]" />
              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> {cars.length} cars available
                </div>
                <h1 className="text-4xl font-bold md:text-6xl">
                  {company.websiteHeroTitle || company.slogan || "Your Journey Starts Here"}
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg text-teal-100">
                  {company.websiteHeroSubtitle || "Find the perfect car for your next adventure"}
                </p>
                <a href="#cars" className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-teal-700 shadow-lg hover:shadow-xl transition-shadow">
                  Browse Cars
                </a>
              </div>
            </section>
          )}
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Available Vehicles</h2>
              <p className="mt-2 text-gray-500">Quality cars at affordable prices</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-teal-600" accentHover="hover:bg-teal-700" />
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
