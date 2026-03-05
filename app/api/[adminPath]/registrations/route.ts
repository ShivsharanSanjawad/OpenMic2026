import { Prisma, RegistrationStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromCookie } from "@/lib/auth";
import { toCsv, toJson } from "@/lib/export";
import { assertAllowedOrigin, sanitizeText } from "@/lib/security";
import { getPublicSettings } from "@/lib/settings";
import { sendPaymentRejectedEmail, sendPaymentVerifiedEmail } from "@/lib/email";

const correctionFieldOptions = [
  "paymentScreenshot",
  "scriptFile",
  "college",
  "phone",
  "performanceTitle",
  "duration",
  "teamMembers",
] as const;

type CorrectionField = (typeof correctionFieldOptions)[number];

function sanitizeAllowedCorrectionFields(value: unknown): CorrectionField[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<string>(correctionFieldOptions);
  return value
    .map((item) => sanitizeText(item, 40))
    .filter((item): item is CorrectionField => allowed.has(item));
}

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function guard(adminPath: string) {
  if (adminPath !== process.env.ADMIN_BASE_PATH) return false;
  const admin = await getAdminFromCookie();
  return Boolean(admin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  const { adminPath } = await params;
  if (!(await guard(adminPath))) return notFound();

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const status = searchParams.get("status") as RegistrationStatus | null;

  const rows = await prisma.registration.findMany({
    where: status ? { paymentStatus: status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { adminComments: { orderBy: { createdAt: "asc" } } },
  });

  if (format === "csv") {
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="registrations.csv"',
      },
    });
  }

  if (format === "json") {
    return new NextResponse(toJson(rows), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="registrations.json"',
      },
    });
  }

  return NextResponse.json({ registrations: rows });
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
  const id = sanitizeText(body.id, 50);
  const paymentStatus = sanitizeText(body.paymentStatus, 30) as RegistrationStatus;
  const adminComment = sanitizeText(body.adminComment, 800);
  const allowedCorrectionFields = sanitizeAllowedCorrectionFields(body.allowedCorrectionFields);

  if (!Object.values(RegistrationStatus).includes(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  }

  if ((paymentStatus === "REJECTED" || paymentStatus === "PENDING_CORRECTION") && !adminComment) {
    return NextResponse.json({ error: "Comment is required for this status" }, { status: 400 });
  }

  const existing = await prisma.registration.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  if (paymentStatus === "PENDING_CORRECTION" && allowedCorrectionFields.length === 0) {
    return NextResponse.json({ error: "Select at least one editable field when requesting corrections" }, { status: 400 });
  }

  const commentMessage =
    paymentStatus === "REJECTED" || paymentStatus === "PENDING_CORRECTION"
      ? adminComment
      : `Status changed to ${paymentStatus}`;

  const [updated] = await prisma.$transaction([
    prisma.registration.update({
      where: { id },
      data: {
        paymentStatus,
        adminComment: (paymentStatus === "REJECTED" || paymentStatus === "PENDING_CORRECTION") ? adminComment : null,
        requiresReupload: paymentStatus === "PENDING_CORRECTION",
        allowedCorrectionFields: paymentStatus === "PENDING_CORRECTION" ? (allowedCorrectionFields as Prisma.InputJsonValue) : [],
      },
    }),
    prisma.adminComment.create({
      data: {
        registrationId: id,
        message: commentMessage,
        status: paymentStatus,
        requiresReupload: paymentStatus === "PENDING_CORRECTION",
        allowedFields: paymentStatus === "PENDING_CORRECTION" ? (allowedCorrectionFields as Prisma.InputJsonValue) : [],
      },
    }),
  ]);

  if (paymentStatus === "VERIFIED" || paymentStatus === "REJECTED" || paymentStatus === "PENDING_CORRECTION") {
    try {
      const settings = await getPublicSettings();

      if (paymentStatus === "VERIFIED") {
        await sendPaymentVerifiedEmail(
          {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            performanceType: updated.performanceType,
            performanceTitle: updated.performanceTitle,
            paymentStatus: updated.paymentStatus,
          },
          {
            eventDate: settings.event_date,
            eventVenue: settings.event_venue,
          },
        );
      } else { // REJECTED or PENDING_CORRECTION
        await sendPaymentRejectedEmail(
          {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            performanceType: updated.performanceType,
            performanceTitle: updated.performanceTitle,
            paymentStatus: updated.paymentStatus,
          },
          {
            eventDate: settings.event_date,
            eventVenue: settings.event_venue,
          },
          adminComment,
          paymentStatus === "PENDING_CORRECTION"
        );
      }

      await prisma.registration.update({
        where: { id: updated.id },
        data: { emailSent: true, emailError: null, emailLastAttempt: new Date() },
      });
    } catch (error) {
      const emailError = error instanceof Error ? error.message.slice(0, 500) : "Unknown email error";
      await prisma.registration.update({
        where: { id: updated.id },
        data: { emailSent: false, emailError, emailLastAttempt: new Date() },
      });
    }
  }


  const latest = await prisma.registration.findUnique({
    where: { id: updated.id },
    include: { adminComments: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ success: true, registration: latest ?? updated });
}
