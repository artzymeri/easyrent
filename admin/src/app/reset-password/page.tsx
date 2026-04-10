"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

import { AdminLeftPanel } from "./_components/admin-left-panel";
import { AdminForgotPasswordForm } from "./_components/admin-forgot-password-form";
import { AdminResetPasswordForm } from "./_components/admin-reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const hasToken = searchParams.has("token");
  return hasToken ? <AdminResetPasswordForm /> : <AdminForgotPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <AdminLeftPanel />

      <div className="flex w-full flex-col bg-gray-50/50 lg:w-1/2">
        <header className="flex h-16 items-center border-b bg-white px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={28} height={28} className="drop-shadow-md" />
            <span className="text-lg font-bold">EasyRent Admin</span>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}>
              <ResetPasswordContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
