import type { WebsitePage } from "@/lib/types";

interface AboutSectionProps {
  page: WebsitePage;
  variant?: "light" | "dark";
}

export function AboutSection({ page, variant = "light" }: AboutSectionProps) {
  const isDark = variant === "dark";

  return (
    <div className={`${isDark ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}>
      {page.heroImageUrl && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={page.heroImageUrl} alt={page.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">{page.title}</h1>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-4xl px-6 py-16">
        {!page.heroImageUrl && (
          <h1 className="mb-8 text-3xl font-bold md:text-4xl">{page.title}</h1>
        )}
        {page.content && (
          <div
            className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>
    </div>
  );
}
