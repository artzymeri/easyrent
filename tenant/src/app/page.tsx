import { getCompany, getCars, getSlides } from "@/lib/api";
import { getTemplate } from "@/templates";

interface PageProps {
  searchParams: Promise<{ subdomain?: string }>;
}

export default async function TenantPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const subdomain = params.subdomain;

  if (!subdomain) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Kindura</h1>
          <p className="mt-2 text-gray-500">Please visit a company subdomain to view their cars.</p>
        </div>
      </div>
    );
  }

  const [company, carsData, slides] = await Promise.all([
    getCompany(subdomain),
    getCars(subdomain),
    getSlides(subdomain),
  ]);

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="mt-2 text-gray-500">This company website was not found.</p>
        </div>
      </div>
    );
  }

  const { rows: cars, currency } = carsData;
  const Template = getTemplate(company.websiteTemplate);

  return <Template company={company} cars={cars} currency={currency} subdomain={subdomain} slides={slides} page="home" />;
}
