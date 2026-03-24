import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary, uploadScriptToCloudinary } from "@/lib/cloudinary";
import { saveImageLocally, saveScriptLocally } from "@/lib/local-upload";
import { assertAllowedOrigin, sanitizeText } from "@/lib/security";
import { getPublicSettings } from "@/lib/settings";
import { sendReuploadReceivedEmail } from "@/lib/email";

const maxScriptBytes = 2 * 1024 * 1024;
const maxScreenshotBytes = 1 * 1024 * 1024;
const allowedScreenshotMimeTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const allowedScriptMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/rtf",
  "text/rtf",
]);

const editableFieldOptions = [
  "paymentScreenshot",
  "scriptFile",
  "phone",
  "performanceTitle",
  "teamMembers",
] as const;

type EditableField = (typeof editableFieldOptions)[number];

function parseEditableFields(value: unknown): EditableField[] {
  if (!Array.isArray(value)) return [];
  const valid = new Set<string>(editableFieldOptions);
  return value.filter((item): item is EditableField => typeof item === "string" && valid.has(item));
}

export async function POST(request: NextRequest) {
  if (!assertAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const disableCloudinary = process.env.DISABLE_CLOUDINARY === "true";
  const disableGmail = process.env.DISABLE_GMAIL === "true";

  const formData = await request.formData();
  const registrationId = sanitizeText(formData.get("registrationId"), 60);
  const screenshot = formData.get("paymentScreenshot");
  const script = formData.get("scriptFile");
  const phone = sanitizeText(formData.get("phone"), 20);
  const performanceTitle = sanitizeText(formData.get("performanceTitle"), 140);
  const teamMembers = sanitizeText(formData.get("teamMembers"), 400);

  if (!registrationId) {
    return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({ where: { id: registrationId } });
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  if (registration.paymentStatus !== "REJECTED" && registration.paymentStatus !== "PENDING_CORRECTION") {
    return NextResponse.json({ error: "Corrections are only allowed for registrations that are rejected or pending correction" }, { status: 400 });
  }

  if (!registration.requiresReupload) {
    return NextResponse.json({ error: "This registration is not marked for reupload by admin" }, { status: 400 });
  }

  const allowedFields = new Set<EditableField>(parseEditableFields(registration.allowedCorrectionFields));

  if (allowedFields.size === 0) {
    return NextResponse.json({ error: "No editable fields are enabled by admin" }, { status: 400 });
  }

  if (screenshot !== null && !(screenshot instanceof File)) {
    return NextResponse.json({ error: "Invalid payment screenshot" }, { status: 400 });
  }

  if (script !== null && !(script instanceof File)) {
    return NextResponse.json({ error: "Invalid script file" }, { status: 400 });
  }

  const hasScreenshot = screenshot instanceof File && screenshot.size > 0;
  const hasScript = script instanceof File && script.size > 0;
  const hasPhone = Boolean(phone);
  const hasPerformanceTitle = Boolean(performanceTitle);
  const hasTeamMembers = Boolean(teamMembers);

  if (hasScreenshot && !allowedFields.has("paymentScreenshot")) {
    return NextResponse.json({ error: "Payment screenshot updates are not allowed for this registration" }, { status: 400 });
  }

  if (hasScript && !allowedFields.has("scriptFile")) {
    return NextResponse.json({ error: "Script updates are not allowed for this registration" }, { status: 400 });
  }

  if (hasPhone && !allowedFields.has("phone")) {
    return NextResponse.json({ error: "Phone updates are not allowed for this registration" }, { status: 400 });
  }

  if (hasPerformanceTitle && !allowedFields.has("performanceTitle")) {
    return NextResponse.json({ error: "Performance title updates are not allowed for this registration" }, { status: 400 });
  }

  if (hasTeamMembers && !allowedFields.has("teamMembers")) {
    return NextResponse.json({ error: "Team member updates are not allowed for this registration" }, { status: 400 });
  }

  if (!hasScreenshot && !hasScript && !hasPhone && !hasPerformanceTitle && !hasTeamMembers) {
    return NextResponse.json({ error: "Submit at least one allowed correction field" }, { status: 400 });
  }

  if (hasScreenshot && !allowedScreenshotMimeTypes.has(screenshot.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP screenshots are allowed" }, { status: 400 });
  }

  if (hasScreenshot && screenshot.size > maxScreenshotBytes) {
    return NextResponse.json({ error: "Screenshot must be 1MB or smaller" }, { status: 400 });
  }

  if (hasScript) {
    if (!allowedScriptMimeTypes.has(script.type)) {
      return NextResponse.json({ error: "Script must be PDF, DOC, DOCX, TXT, or RTF" }, { status: 400 });
    }

    if (script.size > maxScriptBytes) {
      return NextResponse.json({ error: "Script file must be 2MB or smaller" }, { status: 400 });
    }
  }

  let paymentScreenshotUrl: string | undefined;
  let scriptFileUrl: string | undefined;

  if (hasScreenshot) {
    try {
      if (disableCloudinary) {
        paymentScreenshotUrl = await saveImageLocally(screenshot, "spark/openmic/payments");
      } else {
        try {
          paymentScreenshotUrl = await uploadImageToCloudinary(screenshot, "spark/openmic/payments");
        } catch (cloudinaryErr) {
          console.error("[Cloudinary] Screenshot upload failed, falling back to local:", cloudinaryErr);
          paymentScreenshotUrl = await saveImageLocally(screenshot, "spark/openmic/payments");
        }
      }
    } catch {
      return NextResponse.json({ error: "Failed to upload payment screenshot" }, { status: 400 });
    }
  }

  if (hasScript) {
    try {
      if (disableCloudinary) {
        scriptFileUrl = await saveScriptLocally(script, "spark/openmic/scripts");
      } else {
        try {
          scriptFileUrl = await uploadScriptToCloudinary(script, "spark/openmic/scripts");
        } catch (cloudinaryErr) {
          console.error("[Cloudinary] Script upload failed, falling back to local:", cloudinaryErr);
          scriptFileUrl = await saveScriptLocally(script, "spark/openmic/scripts");
        }
      }
    } catch {
      return NextResponse.json({ error: "Failed to upload script file" }, { status: 400 });
    }
  }

  const teamMembersArray = hasTeamMembers && teamMembers
    ? teamMembers.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const [updated] = await prisma.$transaction([
    prisma.registration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: "PENDING_REVIEW",
        adminComment: null,
        requiresReupload: false,
        allowedCorrectionFields: [],
        ...(hasPhone ? { phone: phone.replace(/[^0-9]/g, "").slice(0, 10) } : {}),
        ...(hasPerformanceTitle ? { performanceTitle } : {}),
        ...(teamMembersArray ? { teamMembers: teamMembersArray as Prisma.InputJsonValue } : {}),
        ...(paymentScreenshotUrl ? { paymentScreenshot: paymentScreenshotUrl } : {}),
        ...(scriptFileUrl ? { scriptFile: scriptFileUrl } : {}),
      },
    }),
    prisma.adminComment.create({
      data: {
        registrationId,
        message: "Participant submitted correction and moved back to pending review",
        status: "PENDING_REVIEW",
        requiresReupload: false,
        allowedFields: [],
      },
    }),
  ]);

  if (!disableGmail) {
    try {
      const settings = await getPublicSettings();
      await sendReuploadReceivedEmail(
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

  if (!latest) {
    return NextResponse.json(
      { success: true, registration: { id: updated.id, paymentStatus: updated.paymentStatus } },
      { status: 200 },
    );
  }

  const reg = latest;
  const tmRaw = reg.teamMembers;
  const tmString = Array.isArray(tmRaw)
    ? tmRaw.filter((s): s is string => typeof s === "string").join(", ")
    : typeof tmRaw === "string"
      ? tmRaw
      : null;

  function parseStringArray(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
  }

  return NextResponse.json(
    {
      success: true,
      registration: {
        id: reg.id,
        name: reg.name,
        phone: reg.phone,
        college: reg.college,
        performanceType: reg.performanceType,
        performanceTitle: reg.performanceTitle,
        teamMembers: tmString,
        paymentStatus: reg.paymentStatus,
        requiresReupload: reg.requiresReupload,
        allowedCorrectionFields: parseStringArray(reg.allowedCorrectionFields),
        canReupload:
          (reg.paymentStatus === "PENDING_CORRECTION" || reg.paymentStatus === "REJECTED")
          && reg.requiresReupload,
        adminComment: reg.adminComment,
        commentHistory: reg.adminComments.map((c) => ({
            id: c.id,
            message: c.message,
            status: c.status,
            requiresReupload: c.requiresReupload,
            allowedCorrectionFields: parseStringArray(c.allowedFields),
            createdAt: c.createdAt.toISOString(),
          })),
        updatedAt: reg.updatedAt,
      },
    },
    { status: 200 },
  );
}
