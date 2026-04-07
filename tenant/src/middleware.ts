import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "kindura.app";

  // Extract subdomain
  let subdomain = "";

  if (hostname.includes("localhost")) {
    // Local dev: read from ?subdomain= query param or X-Subdomain header
    subdomain = request.nextUrl.searchParams.get("subdomain") || "";
  } else {
    // Production: extract from hostname
    const parts = hostname.replace(`.${baseDomain}`, "").split(".");
    if (parts.length > 0 && parts[0] !== hostname) {
      subdomain = parts[0];
    }
  }

  if (!subdomain || subdomain === "www") {
    // Root domain — redirect to the frontend app
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.kindura.app";
    return NextResponse.redirect(appUrl);
  }

  // Pass subdomain to the app via header
  const response = NextResponse.next();
  response.headers.set("x-subdomain", subdomain);

  // Also rewrite to pass subdomain as search param internally
  const url = request.nextUrl.clone();
  url.searchParams.set("subdomain", subdomain);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
