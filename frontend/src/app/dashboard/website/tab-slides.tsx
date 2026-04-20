"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Loader2, Pencil, Image as ImageIcon } from "lucide-react";
import type { WebsiteSlide } from "./types";

interface TabSlidesProps {
  slides: WebsiteSlide[];
  onUpdate: (s: WebsiteSlide[]) => void;
}

export function TabSlides({ slides, onUpdate }: TabSlidesProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<WebsiteSlide | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    buttonText: "",
    buttonLink: "",
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", imageUrl: "", buttonText: "", buttonLink: "" });
    setShowDialog(true);
  };

  const openEdit = (slide: WebsiteSlide) => {
    setEditing(slide);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
    });
    setShowDialog(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const saveSlide = async () => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.put<WebsiteSlide>(`/website/slides/${editing.id}`, form);
        onUpdate(slides.map((s) => (s.id === editing.id ? updated : s)));
      } else {
        const created = await api.post<WebsiteSlide>("/website/slides", form);
        onUpdate([...slides, created]);
      }
      toast.success(t("website.slides.saved"));
      setShowDialog(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteSlide = async (id: number) => {
    try {
      await api.delete(`/website/slides/${id}`);
      onUpdate(slides.filter((s) => s.id !== id));
      toast.success(t("website.slides.deleted"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t("website.slides.title")}</CardTitle>
            <CardDescription className="mt-1">{t("website.slides.description")}</CardDescription>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> {t("website.slides.addSlide")}
          </Button>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("website.slides.noSlides")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50"
                >
                  <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground cursor-grab" />
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {slide.imageUrl ? (
                      <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{slide.title || "Untitled Slide"}</p>
                    <p className="text-sm text-muted-foreground truncate">{slide.subtitle || "No subtitle"}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSlide(slide.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("website.slides.editSlide") : t("website.slides.addSlide")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("website.slides.slideImage")}</Label>
              <div className="mt-2">
                {form.imageUrl ? (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg border">
                    <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-accent/50">
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t("website.slides.slideTitle")}</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Slide title" />
              </div>
              <div>
                <Label>{t("website.slides.slideSubtitle")}</Label>
                <Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Slide subtitle" />
              </div>
              <div>
                <Label>{t("website.slides.buttonText")}</Label>
                <Input value={form.buttonText} onChange={(e) => setForm((p) => ({ ...p, buttonText: e.target.value }))} placeholder="Book Now" />
              </div>
              <div>
                <Label>{t("website.slides.buttonLink")}</Label>
                <Input value={form.buttonLink} onChange={(e) => setForm((p) => ({ ...p, buttonLink: e.target.value }))} placeholder="#cars" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={saveSlide} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
