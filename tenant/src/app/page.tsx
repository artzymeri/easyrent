import { getCompany, getCars } from "@/lib/api";
import { ClassicTemplate } from "@/templates/classic";
import { ModernTemplate } from "@/templates/modern";
import { ElegantTemplate } from "@/templates/elegant";
import { SportyTemplate } from "@/templates/sporty";
import { MinimalTemplate } from "@/templates/minimal";

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

  const [company, carsData] = await Promise.all([
    getCompany(subdomain),
    getCars(subdomain),
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

  const templateProps = { company, cars, currency, subdomain };

  switch (company.websiteTemplate) {
    case "modern":
      return <ModernTemplate {...templateProps} />;
    case "elegant":
      return <ElegantTemplate {...templateProps} />;
    case "sporty":
      return <SportyTemplate {...templateProps} />;
    case "minimal":
      return <MinimalTemplate {...templateProps} />;
    case "classic":
    default:
      return <ClassicTemplate {...templateProps} />;
  }
}
