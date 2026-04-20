import { getCompany, getCars, getSlides, getBlogPost } from "@/lib/api";
import { getTemplate } from "@/templates";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subdomain?: string }>;
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  const [{ slug }, { subdomain }] = await Promise.all([params, searchParams]);
  if (!subdomain) return notFound();

  const [company, carsData, slides, blogPost] = await Promise.all([
    getCompany(subdomain),
    getCars(subdomain),
    getSlides(subdomain),
    getBlogPost(subdomain, slug),
  ]);

  if (!company || !blogPost) return notFound();

  const { rows: cars, currency } = carsData;
  const Template = getTemplate(company.websiteTemplate);

  return <Template company={company} cars={cars} currency={currency} subdomain={subdomain} slides={slides} page="blog-post" blogPost={blogPost} />;
}

function notFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-gray-500">Post not found.</p>
      </div>
    </div>
  );
}
