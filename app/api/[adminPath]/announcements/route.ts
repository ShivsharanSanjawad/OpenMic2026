import { AnnouncementType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { assertAllowedOrigin, sanitizeText } from "@/lib/security";

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function guard(adminPath: string) {
  if (adminPath !== process.env.ADMIN_BASE_PATH) return false;
  const admin = await getAdminFromCookie();
  return Boolean(admin);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  const { adminPath } = await params;
  if (!(await guard(adminPath))) return notFound();

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ announcements });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  const { adminPath } = await params;
  if (!(await guard(adminPath))) return notFound();
  if (!assertAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = await request.json();
  const type = sanitizeText(body.type, 20) as AnnouncementType;
  if (!Object.values(AnnouncementType).includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: sanitizeText(body.title, 200),
      body: sanitizeText(body.body, 6000),
      type,
      isPinned: Boolean(body.isPinned),
      isPublished: Boolean(body.isPublished),
      publishedAt: body.isPublished ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true, announcement }, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  const { adminPath } = await params;
  if (!(await guard(adminPath))) return notFound();
  if (!assertAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = await request.json();
  const id = sanitizeText(body.id, 80);

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      title: body.title ? sanitizeText(body.title, 200) : undefined,
      body: body.body ? sanitizeText(body.body, 6000) : undefined,
      isPinned: body.isPinned,
      isPublished: body.isPublished,
      publishedAt: body.isPublished ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true, announcement });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  const { adminPath } = await params;
  if (!(await guard(adminPath))) return notFound();
  if (!assertAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = await request.json();
  const id = sanitizeText(body.id, 80);

  await prisma.announcement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
