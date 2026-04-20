"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import type { WebsitePage } from "./types";

interface TabPagesProps {
  pages: WebsitePage[];
  onUpdate: (p: WebsitePage[]) => void;
}

const DEFAULT_ABOUT: Partial<WebsitePage> = {
  slug: "about",
  title: "About Us",
  content: "",
  isPublished: true,
  heroImageUrl: null,
  extraData: {},
};

const DEFAULT_CONTACT: Partial<WebsitePage> = {
  slug: "contact",
  title: "Contact Us",
  content: "",
  isPublished: true,
  heroImageUrl: null,
  extraData: { hours: "", mapEmbed: "" },
};

export function TabPages({ pages, onUpdate }: TabPagesProps) {
  const { t } = useTranslation();
  const aboutPage = pages.find((p) => p.slug === "about");
  const contactPage = pages.find((p) => p.slug === "contact");

  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">{t("website.pages.about")}</TabsTrigger>
          <TabsTrigger value="contact">{t("website.pages.contact")}</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-4">
          <PageEditor
            page={aboutPage || (DEFAULT_ABOUT as WebsitePage)}
            slug="about"
            onSave={(p) => {
              const idx = pages.findIndex((pg) => pg.slug === "about");
              if (idx >= 0) {
                const updated = [...pages];
                updated[idx] = p;
                onUpdate(updated);
              } else {
                onUpdate([...pages, p]);
              }
            }}
          />
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <PageEditor
            page={contactPage || (DEFAULT_CONTACT as WebsitePage)}
            slug="contact"
            showContactFields
            onSave={(p) => {
              const idx = pages.findIndex((pg) => pg.slug === "contact");
              if (idx >= 0) {
                const updated = [...pages];
                updated[idx] = p;
                onUpdate(updated);
              } else {
                onUpdate([...pages, p]);
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PageEditor({
  page,
  slug,
  showContactFields,
  onSave,
}: {
  page: WebsitePage;
  slug: string;
  showContactFields?: boolean;
  onSave: (p: WebsitePage) => void;
}) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: page.title || "",
    content: page.content || "",
    isPublished: page.isPublished ?? true,
    heroImageUrl: page.heroImageUrl || "",
    extraData: (page.extraData as Record<string, string>) || {},
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, heroImageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.put<WebsitePage>(`/website/pages/${slug}`, form);
      onSave(updated);
      toast.success(t("website.pages.saved"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {form.title || slug}
          <div className="flex items-center gap-2 text-sm font-normal">
            <span className="text-muted-foreground">Published</span>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(v) => setForm((p) => ({ ...p, isPublished: v }))}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>{t("website.pages.pageTitle")}</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>

        <div>
          <Label>{t("website.pages.heroImage")}</Label>
          <div className="mt-2">
            {form.heroImageUrl ? (
              <div className="relative aspect-[3/1] overflow-hidden rounded-lg border">
                <img src={form.heroImageUrl} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => setForm((p) => ({ ...p, heroImageUrl: "" }))}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex aspect-[3/1] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-accent/50">
                <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload hero image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label>{t("website.pages.pageContent")}</Label>
          <Textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            rows={10}
            placeholder="Write your page content here... You can use HTML for formatting."
          />
        </div>

        {showContactFields && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("website.pages.contactHours")}</Label>
              <Input
                value={form.extraData.hours || ""}
                onChange={(e) => setForm((p) => ({ ...p, extraData: { ...p.extraData, hours: e.target.value } }))}
                placeholder="Mon-Fri: 9AM-6PM"
              />
            </div>
            <div>
              <Label>{t("website.pages.contactMapEmbed")}</Label>
              <Input
                value={form.extraData.mapEmbed || ""}
                onChange={(e) => setForm((p) => ({ ...p, extraData: { ...p.extraData, mapEmbed: e.target.value } }))}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="min-w-[120px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Page"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
