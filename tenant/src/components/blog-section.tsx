import Link from "next/link";
import type { BlogPost } from "@/lib/types";
import { Calendar, User, ArrowRight } from "lucide-react";

interface BlogListProps {
  posts: BlogPost[];
  subdomain: string;
  variant?: "light" | "dark";
  accentColor?: string;
}

export function BlogList({ posts, subdomain, variant = "light", accentColor = "#2563eb" }: BlogListProps) {
  const isDark = variant === "dark";

  if (posts.length === 0) {
    return (
      <div className={`mx-auto max-w-6xl px-6 py-16 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        <h1 className={`mb-8 text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Blog</h1>
        <p className="text-center py-12">No blog posts yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-6xl px-6 py-16`}>
      <h1 className={`mb-10 text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Blog</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}?subdomain=${subdomain}`}
            className={`group overflow-hidden rounded-2xl border transition-all hover:shadow-xl ${
              isDark ? "border-white/10 bg-white/5 hover:border-white/20" : "border-gray-200 bg-white"
            }`}
          >
            <div className="aspect-[16/9] overflow-hidden bg-gray-200">
              {post.coverImageUrl ? (
                <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className={`flex h-full items-center justify-center ${isDark ? "bg-white/5 text-gray-600" : "bg-gray-100 text-gray-300"}`}>
                  <span className="text-4xl font-bold">{post.title.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className={`text-lg font-bold group-hover:underline ${isDark ? "text-white" : "text-gray-900"}`}>
                {post.title}
              </h2>
              {post.excerpt && (
                <p className={`mt-2 text-sm line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {post.excerpt}
                </p>
              )}
              <div className={`mt-4 flex items-center justify-between text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                <div className="flex items-center gap-3">
                  {post.authorName && (
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.authorName}</span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: accentColor }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface BlogArticleProps {
  post: BlogPost;
  variant?: "light" | "dark";
}

export function BlogArticle({ post, variant = "light" }: BlogArticleProps) {
  const isDark = variant === "dark";

  return (
    <div>
      {post.coverImageUrl && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className={`text-3xl font-bold md:text-4xl ${isDark ? "text-white" : "text-gray-900"}`}>
          {post.title}
        </h1>
        <div className={`mt-4 flex items-center gap-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {post.authorName && <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.authorName}</span>}
          {post.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.publishedAt).toLocaleDateString()}</span>}
        </div>
        <div
          className={`mt-8 prose max-w-none ${isDark ? "prose-invert" : ""}`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
