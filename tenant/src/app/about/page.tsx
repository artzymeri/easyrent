import { getCompany, getCars, getSlides, getPage } from "@/lib/api";
import { getTemplate } from "@/templates";

interface PageProps {
  searchParams: Promise<{ subdomain?: string }>;
}

export default async function AboutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const subdomain = params.subdomain;
  if (!subdomain) return notFound();

  const [company, carsData, slides, pageData] = await Promise.all([
    getCompany(subdomain),
    getCars(subdomain),
    getSlides(subdomain),
    getPage(subdomain, "about"),
  ]);

  if (!company) return notFound();

  const { rows: cars, currency } = carsData;
  const Template = getTemplate(company.websiteTemplate);

  return <Template company={company} cars={cars} currency={currency} subdomain={subdomain} slides={slides} page="about" pageData={pageData} />;
}

function notFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-500">Page not found.</p>
      </div>
    </div>
  );
}
