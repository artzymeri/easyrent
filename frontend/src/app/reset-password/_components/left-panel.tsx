"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n";
import { Car, ShieldCheck } from "lucide-react";

export function LeftPanel() {
  const { t } = useTranslation();

  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-cyan-500 lg:flex lg:flex-col lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute right-[5%] bottom-[20%] h-60 w-60 rounded-full bg-cyan-300/15 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[12%] top-[22%] opacity-20">
          <Car className="h-10 w-10 text-white" />
        </div>
        <div className="absolute right-[15%] bottom-[35%] opacity-15">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center px-12 text-center">
        <div className="mb-8">
          <Image
            src="/logo_without_bg.png"
            alt="EasyRent"
            width={100}
            height={100}
            className="drop-shadow-2xl brightness-0 invert"
            priority
          />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
          {t("landing.heroTitle")}
        </h2>
        <p className="mt-4 max-w-md text-lg text-white/70">
          {t("landing.heroDescription")}
        </p>
      </div>
    </div>
  );
}
