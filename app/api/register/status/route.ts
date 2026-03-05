import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/security";

function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawId = searchParams.get("id");
  const id = sanitizeText(rawId, 60);

  if (!id) {
    return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { adminComments: { orderBy: { createdAt: "asc" } } },
  });
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      registration: {
        id: registration.id,
        name: registration.name,
        phone: registration.phone,
        college: registration.college,
        performanceType: registration.performanceType,
        performanceTitle: registration.performanceTitle,
        duration: registration.duration,
        teamMembers: registration.teamMembers,
        paymentStatus: registration.paymentStatus,
        requiresReupload: registration.requiresReupload,
        allowedCorrectionFields: parseStringArray(registration.allowedCorrectionFields),
        canReupload: registration.paymentStatus === "PENDING_CORRECTION" && registration.requiresReupload,
        adminComment: registration.adminComment,
        adminComments: registration.adminComments.map((c) => ({
          id: c.id,
          message: c.message,
          status: c.status,
          requiresReupload: c.requiresReupload,
          allowedFields: parseStringArray(c.allowedFields),
          createdAt: c.createdAt.toISOString(),
        })),
        updatedAt: registration.updatedAt,
      },
    },
    { status: 200 },
  );
}
