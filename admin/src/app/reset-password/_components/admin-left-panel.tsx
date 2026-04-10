"use client";

import Image from "next/image";

export function AdminLeftPanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 lg:flex lg:flex-col lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="absolute right-[10%] bottom-[25%] h-48 w-48 rounded-full bg-violet-500/8 blur-3xl" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center px-12 text-center">
        <div className="mb-10">
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 blur-xl" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <Image
                src="/logo_without_bg.png"
                alt="EasyRent"
                width={64}
                height={64}
                className="drop-shadow-2xl brightness-0 invert"
                priority
              />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
          Admin Control Center
        </h2>
        <p className="mt-3 max-w-sm text-base text-gray-400">
          Manage all companies, monitor fleet operations, and oversee the entire platform.
        </p>
      </div>
    </div>
  );
}
