import { NextRequest, NextResponse } from "next/server";
import { secureHeaders } from "@/lib/security";
import { validateSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Generate a unique nonce for this request — used by CSP to allow
  // Next.js hydration scripts without requiring 'unsafe-inline'.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Forward the nonce in request headers so Next.js App Router can
  // read it (via headers()) and apply it to its own inline scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  const headers = secureHeaders(nonce);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  const adminBasePath = process.env.ADMIN_BASE_PATH;
  const pathname = request.nextUrl.pathname;

  if (adminBasePath && pathname.startsWith(`/${adminBasePath}`)) {
    const isLoginPage = pathname === `/${adminBasePath}`;
    if (isLoginPage) return response;

    const sessionToken = request.cookies.get("admin_session")?.value;
    const session = await validateSession(sessionToken);

    if (!session) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|models/.*\\.glb).*)"],
};

