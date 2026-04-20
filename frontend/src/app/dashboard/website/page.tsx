"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Globe, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { TabGeneral } from "./tab-general";
import { TabSlides } from "./tab-slides";
import { TabPages } from "./tab-pages";
import { TabBlog } from "./tab-blog";
import type { WebsiteSettings, WebsiteSlide, WebsitePage, BlogPost } from "./types";

export default function WebsiteManagerPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [slides, setSlides] = useState<WebsiteSlide[]>([]);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  const fetchAll = useCallback(async () => {
    try {
      const [s, sl, p, b] = await Promise.all([
        api.get<WebsiteSettings>("/website/settings"),
        api.get<WebsiteSlide[]>("/website/slides"),
        api.get<WebsitePage[]>("/website/pages"),
        api.get<BlogPost[]>("/website/blog"),
      ]);
      setSettings(s);
      setSlides(sl);
      setPages(p);
      setPosts(b);
    } catch {
      toast.error("Failed to load website data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("website.title")}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("website.subtitle")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max shrink-0 sm:w-auto">
            <TabsTrigger value="general" className="gap-1.5">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{t("website.tabs.general")}</span>
              <span className="sm:hidden">General</span>
            </TabsTrigger>
            <TabsTrigger value="slides">{t("website.tabs.slides")}</TabsTrigger>
            <TabsTrigger value="pages">{t("website.tabs.pages")}</TabsTrigger>
            <TabsTrigger value="blog">{t("website.tabs.blog")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-4 overflow-y-auto p-1">
          <TabGeneral settings={settings} onUpdate={setSettings} />
        </TabsContent>

        <TabsContent value="slides" className="mt-4 overflow-y-auto p-1">
          <TabSlides slides={slides} onUpdate={setSlides} />
        </TabsContent>

        <TabsContent value="pages" className="mt-4 overflow-y-auto p-1">
          <TabPages pages={pages} onUpdate={setPages} />
        </TabsContent>

        <TabsContent value="blog" className="mt-4 overflow-y-auto p-1">
          <TabBlog posts={posts} onUpdate={setPosts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
