"use client";

import { useTranslation } from "@/lib/i18n";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface InsuranceProvider {
  id: number;
  name: string;
  isActive: boolean;
}

/** Format stored name (lowercase-dashed) to display name (Capitalized Words) */
export function formatInsuranceName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export interface InsuranceProvidersSectionProps {
  providers: InsuranceProvider[];
  ipLoading: boolean;
  showAddIp: boolean;
  setShowAddIp: (v: boolean) => void;
  newIpName: string;
  setNewIpName: (v: string) => void;
  addingIp: boolean;
  handleAddIp: () => void;
  editingIpId: number | null;
  editIpName: string;
  setEditIpName: (v: string) => void;
  handleUpdateIp: (id: number) => void;
  handleDeleteIp: (id: number) => void;
  startEditIp: (provider: InsuranceProvider) => void;
  setEditingIpId: (id: number | null) => void;
}

export function InsuranceProvidersSection({
  providers,
  ipLoading,
  showAddIp,
  setShowAddIp,
  newIpName,
  setNewIpName,
  addingIp,
  handleAddIp,
  editingIpId,
  editIpName,
  setEditIpName,
  handleUpdateIp,
  handleDeleteIp,
  startEditIp,
  setEditingIpId,
}: InsuranceProvidersSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("settings.insuranceProviders")}
            </CardTitle>
            <CardDescription>
              {t("settings.insuranceProvidersDescription")}
            </CardDescription>
          </div>
          {!showAddIp && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddIp(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("settings.addInsuranceProvider")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new insurance provider form */}
        {showAddIp && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">
                {t("settings.insuranceProviderName")} *
              </Label>
              <Input
                value={newIpName}
                onChange={(e) => setNewIpName(e.target.value)}
                placeholder={t("settings.insuranceProviderNamePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIp();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddIp(false);
                  setNewIpName("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleAddIp}
                disabled={addingIp || !newIpName.trim()}
              >
                {addingIp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {t("settings.addInsuranceProvider")}
              </Button>
            </div>
          </div>
        )}

        {/* List of insurance providers */}
        {ipLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : providers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t("settings.noInsuranceProviders")}
          </p>
        ) : (
          <div className="space-y-2">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {editingIpId === provider.id ? (
                  <>
                    <div className="flex-1">
                      <Input
                        value={editIpName}
                        onChange={(e) => setEditIpName(e.target.value)}
                        placeholder={t(
                          "settings.insuranceProviderNamePlaceholder"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdateIp(provider.id);
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleUpdateIp(provider.id)}
                      disabled={!editIpName.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setEditingIpId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {formatInsuranceName(provider.name)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => startEditIp(provider)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteIp(provider.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
