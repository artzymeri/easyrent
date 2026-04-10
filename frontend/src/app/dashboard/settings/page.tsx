"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Building2, Loader2, User, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

import type { CompanySettings, StaffUser, CompanyForm, ProfileForm } from "./types";
import { TabPreferences } from "./tab-preferences";
import { TabAccount } from "./tab-account";
import { TabCompany } from "./tab-company";

function buildCompanyForm(data: CompanySettings): CompanyForm {
  return {
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "",
    country: data.country || "",
    slogan: data.slogan || "",
    logoUrl: data.logoUrl || "",
    signature: data.signature || "",
    stampUrl: data.stampUrl || "",
    businessNumber: data.businessNumber || "",
    businessFaxNumber: data.businessFaxNumber || "",
    companyIdNumber: data.companyIdNumber || "",
  };
}

function buildProfileForm(user: StaffUser): ProfileForm {
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
  };
}

export default function SettingsPage() {
  const { t } = useTranslation();

  const [user, setUser] = useState<StaffUser | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | number>("preferences");

  const isManager = user?.role === "manager";

  const fetchSettings = useCallback(async () => {
    try {
      const [data, meData] = await Promise.all([
        api.get<CompanySettings>("/settings"),
        api.get<{ user: StaffUser }>("/auth/me"),
      ]);
      setUser(meData.user);
      setCompany(data);
    } catch {
      toast.error(t("settings.failedLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("settings.subtitle")}</p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="w-max shrink-0 sm:w-auto">
            <TabsTrigger value="preferences" className="gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t("settings.tabs.preferences")}</span>
              <span className="sm:hidden">Prefs</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-1.5">
              <User className="h-4 w-4" />
              {t("settings.tabs.account")}
            </TabsTrigger>
            {isManager && (
              <TabsTrigger value="company" className="gap-1.5">
                <Building2 className="h-4 w-4" />
                {t("settings.tabs.company")}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="preferences" className="mt-4 overflow-y-auto p-1">
          <TabPreferences isManager={isManager} />
        </TabsContent>

        <TabsContent value="account" className="mt-4 flex min-h-0 flex-1 flex-col">
          <TabAccount
            user={user}
            onUserUpdate={setUser}
            initialProfile={buildProfileForm(user)}
          />
        </TabsContent>

        {isManager && company && (
          <TabsContent value="company" className="mt-4 flex min-h-0 flex-1 flex-col">
            <TabCompany
              company={company}
              onCompanyUpdate={setCompany}
              initialForm={buildCompanyForm(company)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
