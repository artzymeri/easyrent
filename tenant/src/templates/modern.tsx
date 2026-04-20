import type { TemplateProps } from "./types";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { HeroSlider } from "@/components/hero-slider";
import { CarsGrid } from "@/components/cars-grid";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { BlogList, BlogArticle } from "@/components/blog-section";

export function ModernTemplate({ company, cars, currency, subdomain, slides, page = "home", pageData, blogPosts, blogPost }: TemplateProps) {
  const color = company.websitePrimaryColor || "#7c3aed";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href={`/?subdomain=${subdomain}`} className="flex items-center gap-3">
            {company.logoUrl && (
              <img src={company.logoUrl} alt={company.name} className="h-9 w-auto max-w-[120px] rounded-full object-contain ring-2 ring-violet-500/50" />
            )}
            <span className="text-lg font-bold text-white">{company.name}</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            {(company.websiteNavLinks || ["home", "cars", "about", "contact", "blog"]).filter(l => l !== "cars").map((link) => (
              <a
                key={link}
                href={link === "home" ? `/?subdomain=${subdomain}` : `/${link}?subdomain=${subdomain}`}
                className={`rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors ${page === link ? "text-white font-semibold" : ""}`}
              >
                {link.charAt(0).toUpperCase() + link.slice(1)}
              </a>
            ))}
            {company.phone && (
              <a href={`tel:${company.phone}`} className="ml-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
                Call Us
              </a>
            )}
          </div>
        </div>
      </nav>

      {page === "home" && (
        <>
          <div className="pt-16">
            <HeroSlider slides={slides} company={company} accentColor={color} overlay="bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-violet-950/40" height="min-h-[80vh]" />
          </div>
          <section id="cars" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700">
                {cars.length} vehicles available
              </div>
              <h2 className="text-3xl font-bold">Our Fleet</h2>
              <p className="mt-2 text-gray-500">Choose from our carefully maintained vehicles</p>
            </div>
            <CarsGrid cars={cars} currency={currency} subdomain={subdomain} accentColor="bg-violet-600" accentHover="hover:bg-violet-700" cardStyle="rounded" />
          </section>
        </>
      )}

      {page === "about" && pageData && <div className="pt-20"><AboutSection page={pageData} /></div>}
      {page === "contact" && pageData && <div className="pt-20"><ContactSection company={company} page={pageData} accentColor={color} /></div>}
      {page === "blog" && <div className="pt-20"><BlogList posts={blogPosts || []} subdomain={subdomain} accentColor={color} /></div>}
      {page === "blog-post" && blogPost && <div className="pt-20"><BlogArticle post={blogPost} /></div>}

      <SiteFooter company={company} variant="dark" />
    </div>
  );
}
