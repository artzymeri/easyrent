"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  Eye,
  EyeOff,
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
import { toast } from "sonner";
import type { StaffUser, ProfileForm } from "./types";

interface TabAccountProps {
  user: StaffUser;
  onUserUpdate: (user: StaffUser) => void;
  initialProfile: ProfileForm;
}

export function TabAccount({ user, onUserUpdate, initialProfile }: TabAccountProps) {
  const { t } = useTranslation();

  const [profileForm, setProfileForm] = useState<ProfileForm>(initialProfile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const updateProfileField = (field: keyof ProfileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const data = await api.put<StaffUser>("/staff/me", profileForm);
      onUserUpdate(data);
      toast.success(t("settings.saved"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("settings.failedSave");
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("settings.passwordMismatch"));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t("settings.passwordTooShort"));
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/staff/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(t("settings.passwordChanged"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("settings.failedSave");
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto p-1 pb-4">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("settings.profile")}
            </CardTitle>
            <CardDescription>
              {t("settings.profileDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("settings.firstName")}</Label>
                <Input
                  value={profileForm.firstName}
                  onChange={(e) => updateProfileField("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.lastName")}</Label>
                <Input
                  value={profileForm.lastName}
                  onChange={(e) => updateProfileField("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {t("settings.email")}
                </Label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => updateProfileField("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {t("settings.phone")}
                </Label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => updateProfileField("phone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {t("settings.changePassword")}
            </CardTitle>
            <CardDescription>
              {t("settings.changePasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.currentPassword")}</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.newPassword")}</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.confirmPassword")}</Label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="••••••••"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t bg-background pt-4 pb-2">
        <div className="flex gap-3 justify-end">
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("settings.saveProfile")}
          </Button>
          <Button
            onClick={handleChangePassword}
            disabled={
              savingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
            variant="outline"
          >
            {savingPassword ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {t("settings.updatePassword")}
          </Button>
        </div>
      </div>
    </>
  );
}
