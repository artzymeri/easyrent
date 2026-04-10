"use client";

import { useTranslation } from "@/lib/i18n";
import {
  MapPin,
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
import type { DeliveryPointsSectionProps } from "./company-types";

export function DeliveryPointsSection({
  deliveryPoints,
  dpLoading,
  showAddDp,
  setShowAddDp,
  newDpName,
  setNewDpName,
  newDpAddress,
  setNewDpAddress,
  addingDp,
  handleAddDp,
  editingDpId,
  editDpName,
  setEditDpName,
  editDpAddress,
  setEditDpAddress,
  handleUpdateDp,
  handleDeleteDp,
  startEditDp,
  setEditingDpId,
}: DeliveryPointsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("settings.deliveryPoints")}
            </CardTitle>
            <CardDescription>
              {t("settings.deliveryPointsDescription")}
            </CardDescription>
          </div>
          {!showAddDp && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddDp(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("settings.addDeliveryPoint")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new delivery point form */}
        {showAddDp && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  {t("settings.deliveryPointName")} *
                </Label>
                <Input
                  value={newDpName}
                  onChange={(e) => setNewDpName(e.target.value)}
                  placeholder={t("settings.deliveryPointNamePlaceholder")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  {t("settings.deliveryPointAddress")}
                </Label>
                <Input
                  value={newDpAddress}
                  onChange={(e) => setNewDpAddress(e.target.value)}
                  placeholder={t("settings.deliveryPointAddressPlaceholder")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddDp(false);
                  setNewDpName("");
                  setNewDpAddress("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleAddDp}
                disabled={addingDp || !newDpName.trim()}
              >
                {addingDp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {t("settings.addDeliveryPoint")}
              </Button>
            </div>
          </div>
        )}

        {/* List of delivery points */}
        {dpLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : deliveryPoints.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t("settings.noDeliveryPoints")}
          </p>
        ) : (
          <div className="space-y-2">
            {deliveryPoints.map((point) => (
              <div
                key={point.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {editingDpId === point.id ? (
                  <>
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <Input
                        value={editDpName}
                        onChange={(e) => setEditDpName(e.target.value)}
                        placeholder={t(
                          "settings.deliveryPointNamePlaceholder"
                        )}
                      />
                      <Input
                        value={editDpAddress}
                        onChange={(e) => setEditDpAddress(e.target.value)}
                        placeholder={t(
                          "settings.deliveryPointAddressPlaceholder"
                        )}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleUpdateDp(point.id)}
                      disabled={!editDpName.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setEditingDpId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {point.name}
                      </p>
                      {point.address && (
                        <p className="text-xs text-muted-foreground truncate">
                          {point.address}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => startEditDp(point)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDp(point.id)}
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
