"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import type { BlogPost } from "./types";

interface TabBlogProps {
  posts: BlogPost[];
  onUpdate: (p: BlogPost[]) => void;
}

export function TabBlog({ posts, onUpdate }: TabBlogProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImageUrl: "",
    isPublished: false,
  });

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", content: "", excerpt: "", coverImageUrl: "", isPublished: false });
    setShowDialog(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImageUrl: post.coverImageUrl || "",
      isPublished: post.isPublished,
    });
    setShowDialog(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, coverImageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const savePost = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.put<BlogPost>(`/website/blog/${editing.id}`, form);
        onUpdate(posts.map((p) => (p.id === editing.id ? updated : p)));
      } else {
        const created = await api.post<BlogPost>("/website/blog", form);
        onUpdate([created, ...posts]);
      }
      toast.success(t("website.blog.saved"));
      setShowDialog(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: number) => {
    try {
      await api.delete(`/website/blog/${id}`);
      onUpdate(posts.filter((p) => p.id !== id));
      toast.success(t("website.blog.deleted"));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      const updated = await api.put<BlogPost>(`/website/blog/${post.id}`, {
        isPublished: !post.isPublished,
      });
      onUpdate(posts.map((p) => (p.id === post.id ? updated : p)));
      toast.success(updated.isPublished ? "Post published" : "Post unpublished");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>{t("website.blog.title")}</CardTitle>
            <CardDescription className="mt-1">{t("website.blog.description")}</CardDescription>
          </div>
          <Button onClick={openNew} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> {t("website.blog.addPost")}
          </Button>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t("website.blog.noPosts")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/50"
                >
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {post.coverImageUrl ? (
                      <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{post.title}</p>
                      <Badge variant={post.isPublished ? "default" : "secondary"} className="text-xs shrink-0">
                        {post.isPublished ? t("website.blog.published") : t("website.blog.draft")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{post.excerpt || "No excerpt"}</p>
                    {post.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(post)}
                      className="text-xs"
                    >
                      {post.isPublished ? t("website.blog.unpublish") : t("website.blog.publish")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="text-destructive hover:text-destructive">
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("website.blog.editPost") : t("website.blog.addPost")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("website.blog.postTitle")}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="My Blog Post Title"
              />
            </div>

            <div>
              <Label>{t("website.blog.coverImage")}</Label>
              <div className="mt-2">
                {form.coverImageUrl ? (
                  <div className="relative aspect-[2/1] overflow-hidden rounded-lg border">
                    <img src={form.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setForm((p) => ({ ...p, coverImageUrl: "" }))}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex aspect-[2/1] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-accent/50">
                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload cover image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label>{t("website.blog.postExcerpt")}</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                rows={2}
                placeholder="Brief summary of the post..."
              />
            </div>

            <div>
              <Label>{t("website.blog.postContent")}</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                rows={12}
                placeholder="Write your blog post content here... You can use HTML for formatting."
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Publish immediately
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={savePost} disabled={saving || !form.title || !form.content}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Post"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
