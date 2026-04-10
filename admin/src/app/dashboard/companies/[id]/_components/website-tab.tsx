"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Check, ExternalLink } from "lucide-react";
import type { Company } from "./types";

interface WebsiteTabProps {
  company: Company;
  companyId: string;
  onCompanyUpdate: (updates: Partial<Company>) => void;
}

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean and professional with a traditional layout",
    colors: ["#1e293b", "#f8fafc", "#3b82f6"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold and contemporary with large imagery",
    colors: ["#0f172a", "#ffffff", "#8b5cf6"],
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated dark theme with gold accents",
    colors: ["#0c0a09", "#1c1917", "#d4a574"],
  },
  {
    id: "sporty",
    name: "Sporty",
    description: "Dynamic and energetic with vibrant colors",
    colors: ["#18181b", "#fafafa", "#ef4444"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean with lots of whitespace",
    colors: ["#fafafa", "#ffffff", "#171717"],
  },
];

export function WebsiteTab({
  company,
  companyId,
  onCompanyUpdate,
}: WebsiteTabProps) {
  return (
    <div className="space-y-6">
      {/* Publish Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Website Status</CardTitle>
              <CardDescription>
                {company.websitePublished
                  ? "Your website is live and accessible"
                  : "Publish your website to make it publicly accessible"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {company.websitePublished && (
                <a
                  href={`https://${company.subdomain}.kindura.app`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {company.subdomain}.kindura.app
                </a>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={company.websitePublished}
                  onCheckedChange={async (val) => {
                    try {
                      await api.put(`/companies/${companyId}`, {
                        websitePublished: val,
                      });
                      onCompanyUpdate({ websitePublished: val as boolean });
                      toast.success(
                        val ? "Website published!" : "Website unpublished"
                      );
                    } catch {
                      toast.error("Failed to update website status");
                    }
                  }}
                />
                <Badge
                  variant={company.websitePublished ? "default" : "secondary"}
                >
                  {company.websitePublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose Template</CardTitle>
          <CardDescription>
            Select a design template for the company&apos;s public website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={async () => {
                  try {
                    await api.put(`/companies/${companyId}`, {
                      websiteTemplate: template.id,
                    });
                    onCompanyUpdate({ websiteTemplate: template.id });
                    toast.success(`Template changed to ${template.name}`);
                  } catch {
                    toast.error("Failed to update template");
                  }
                }}
                className={`group relative overflow-hidden rounded-xl border-2 p-0 text-left transition-all hover:shadow-lg ${
                  company.websiteTemplate === template.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                {/* Template Preview */}
                <div
                  className="relative flex h-36 flex-col items-center justify-center gap-2"
                  style={{ backgroundColor: template.colors[0] }}
                >
                  {/* Mini layout preview */}
                  <div
                    className="h-3 w-20 rounded-full opacity-80"
                    style={{ backgroundColor: template.colors[2] }}
                  />
                  <div className="flex gap-2">
                    <div
                      className="h-12 w-16 rounded-lg opacity-60"
                      style={{ backgroundColor: template.colors[1] }}
                    />
                    <div
                      className="h-12 w-16 rounded-lg opacity-60"
                      style={{ backgroundColor: template.colors[1] }}
                    />
                    <div
                      className="h-12 w-16 rounded-lg opacity-60"
                      style={{ backgroundColor: template.colors[1] }}
                    />
                  </div>
                  <div
                    className="h-2 w-14 rounded-full opacity-40"
                    style={{ backgroundColor: template.colors[1] }}
                  />

                  {/* Selected checkmark */}
                  {company.websiteTemplate === template.id && (
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
