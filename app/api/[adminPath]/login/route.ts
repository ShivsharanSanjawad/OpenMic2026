import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, adminCookieOptions, createAdminSession } from "@/lib/auth";
import { assertAllowedOrigin, sanitizeText } from "@/lib/security";
import { getAdminBasePath } from "@/lib/env";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  try {
    const { adminPath } = await params;
    const configuredPath = getAdminBasePath();
    if (adminPath !== configuredPath) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!assertAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const body = await request.json();
    const username = sanitizeText(body.username, 80);
    const password = sanitizeText(body.password, 120);

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createAdminSession(admin.username);
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    if (message.includes("Can't reach database server")) {
      return NextResponse.json(
        { error: "Database unavailable. Start PostgreSQL and try again." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Login failed" },
      { status: 500 },
    );
  }
}
