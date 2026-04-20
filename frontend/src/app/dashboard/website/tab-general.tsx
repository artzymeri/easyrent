"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import type { WebsiteSettings } from "./types";
import { TEMPLATE_OPTIONS, NAV_LINK_OPTIONS } from "./types";

interface TabGeneralProps {
  settings: WebsiteSettings;
  onUpdate: (s: WebsiteSettings) => void;
}

export function TabGeneral({ settings, onUpdate }: TabGeneralProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    websiteTemplate: settings.websiteTemplate,
    websitePublished: settings.websitePublished,
    heroSlideSource: settings.heroSlideSource,
    websiteNavLinks: settings.websiteNavLinks || ["home", "cars", "about", "contact", "blog"],
    websitePrimaryColor: settings.websitePrimaryColor || "",
    websiteHeroTitle: settings.websiteHeroTitle || "",
    websiteHeroSubtitle: settings.websiteHeroSubtitle || "",
  });

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.put<WebsiteSettings>("/website/settings", form);
      onUpdate(updated);
      toast.success(t("website.general.saved"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleNavLink = (link: string) => {
    setForm((prev) => ({
      ...prev,
      websiteNavLinks: prev.websiteNavLinks.includes(link)
        ? prev.websiteNavLinks.filter((l) => l !== link)
        : [...prev.websiteNavLinks, link],
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Publish toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("website.general.published")}
            <Switch
              checked={form.websitePublished}
              onCheckedChange={(v) => setForm((p) => ({ ...p, websitePublished: v }))}
            />
          </CardTitle>
          <CardDescription>
            {form.websitePublished ? t("website.general.publishedDesc") : t("website.general.unpublishedDesc")}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Template selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("website.general.template")}</CardTitle>
          <CardDescription>{t("website.general.selectTemplate")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_OPTIONS.map((tmpl) => (
              <button
                key={tmpl.value}
                onClick={() => setForm((p) => ({ ...p, websiteTemplate: tmpl.value }))}
                className={`relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  form.websiteTemplate === tmpl.value ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                <div className={`h-3 w-full rounded-full ${tmpl.preview}`} />
                <div>
                  <p className="font-semibold">{tmpl.label}</p>
                  <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                </div>
                {form.websiteTemplate === tmpl.value && (
                  <div className="absolute right-2 top-2">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hero settings */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("website.general.heroTitle")}</Label>
              <Input
                value={form.websiteHeroTitle}
                onChange={(e) => setForm((p) => ({ ...p, websiteHeroTitle: e.target.value }))}
                placeholder="Rent Your Perfect Car"
              />
            </div>
            <div>
              <Label>{t("website.general.heroSubtitle")}</Label>
              <Input
                value={form.websiteHeroSubtitle}
                onChange={(e) => setForm((p) => ({ ...p, websiteHeroSubtitle: e.target.value }))}
                placeholder="Browse our selection of quality vehicles"
              />
            </div>
          </div>
          <div>
            <Label>{t("website.general.slideSource")}</Label>
            <div className="mt-2 flex gap-2">
              {(["custom", "cars", "both"] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => setForm((p) => ({ ...p, heroSlideSource: src }))}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    form.heroSlideSource === src
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {t(`website.general.slideSource${src.charAt(0).toUpperCase() + src.slice(1)}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t("website.general.primaryColor")}</Label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={form.websitePrimaryColor || "#2563eb"}
                onChange={(e) => setForm((p) => ({ ...p, websitePrimaryColor: e.target.value }))}
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <Input
                value={form.websitePrimaryColor || ""}
                onChange={(e) => setForm((p) => ({ ...p, websitePrimaryColor: e.target.value }))}
                placeholder="#2563eb"
                className="w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation links */}
      <Card>
        <CardHeader>
          <CardTitle>{t("website.general.navLinks")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {NAV_LINK_OPTIONS.map((link) => (
              <button
                key={link.value}
                onClick={() => toggleNavLink(link.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  form.websiteNavLinks.includes(link.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="min-w-[120px]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
