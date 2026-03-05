import { NextRequest, NextResponse } from "next/server";
import { secureHeaders } from "@/lib/security";
import { validateSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const headers = secureHeaders();
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
