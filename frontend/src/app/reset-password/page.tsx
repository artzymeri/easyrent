"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { LeftPanel } from "./_components/left-panel";
import { ForgotPasswordForm } from "./_components/forgot-password-form";
import { ResetPasswordForm } from "./_components/reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const hasToken = searchParams.has("token");
  return hasToken ? <ResetPasswordForm /> : <ForgotPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <LeftPanel />

      <div className="flex w-full flex-col lg:w-1/2">
        <header className="flex h-16 items-center border-b px-6">
          <Link href="/login" className="flex items-center gap-2">
            <Image src="/logo_without_bg.png" alt="EasyRent" width={28} height={28} className="drop-shadow-md" />
            <span className="text-lg font-bold">EasyRent</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Suspense
              fallback={
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              }
            >
              <ResetPasswordContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
