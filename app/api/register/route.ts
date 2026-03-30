import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary, uploadScriptToCloudinary } from "@/lib/cloudinary";
import { saveImageLocally, saveScriptLocally } from "@/lib/local-upload";
import { assertAllowedOrigin, sanitizeJsonInput, sanitizePhone, sanitizeText } from "@/lib/security";
import { getPublicSettings } from "@/lib/settings";
import { sendRegistrationEmail } from "@/lib/email";

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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "Unknown error";
}

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().regex(/^\d{10}$/),
  performanceType: z.enum(["solo", "group"]),
  performanceTitle: z.string().min(1).max(140),
  teamMembers: z.string().max(400).optional(),
});

export async function POST(request: NextRequest) {
  if (!assertAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const isDev = process.env.NODE_ENV !== "production";
  const disableCloudinary = process.env.DISABLE_CLOUDINARY === "true";
  const disableGmail = process.env.DISABLE_GMAIL === "true";

  // Check if registrations are open
  const { registrations_open } = await getPublicSettings();
  if (registrations_open !== "true") {
    return NextResponse.json({ error: "Registrations are currently closed." }, { status: 403 });
  }

  const formData = await request.formData();
  const screenshot = formData.get("paymentScreenshot");
  const script = formData.get("scriptFile");

  if (!(screenshot instanceof File)) {
    return NextResponse.json({ error: "Payment screenshot is required" }, { status: 400 });
  }

  if (!allowedScreenshotMimeTypes.has(screenshot.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP screenshots are allowed" }, { status: 400 });
  }

  if (screenshot.size > maxScreenshotBytes) {
    return NextResponse.json({ error: "Screenshot must be 1MB or smaller" }, { status: 400 });
  }

  if (script !== null && !(script instanceof File)) {
    return NextResponse.json({ error: "Invalid script file" }, { status: 400 });
  }

  if (script instanceof File && script.size > 0) {
    if (!allowedScriptMimeTypes.has(script.type)) {
      return NextResponse.json({ error: "Script must be PDF, DOC, DOCX, TXT, or RTF" }, { status: 400 });
    }

    if (script.size > maxScriptBytes) {
      return NextResponse.json({ error: "Script file must be 2MB or smaller" }, { status: 400 });
    }
  }

  const baseData = {
    name: sanitizeText(formData.get("name")),
    email: sanitizeText(formData.get("email")),
    phone: sanitizePhone(sanitizeText(formData.get("phone"))),
    performanceType: sanitizeText(formData.get("performanceType")).toLowerCase(),
    performanceTitle: sanitizeText(formData.get("performanceTitle")),
    teamMembers: sanitizeText(formData.get("teamMembers"), 400),
  };

  const parsed = schema.safeParse(baseData);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid registration data",
        ...(isDev
          ? {
              details: parsed.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
              })),
            }
          : {}),
      },
      { status: 400 },
    );
  }

  const dynamicFields: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("dynamic_")) {
      dynamicFields[key.replace("dynamic_", "")] = sanitizeText(value, 500);
    }
  }

  let screenshotUrl: string;
  try {
    if (disableCloudinary) {
      screenshotUrl = await saveImageLocally(screenshot, "spark/openmic/payments");
    } else {
      try {
        screenshotUrl = await uploadImageToCloudinary(screenshot, "spark/openmic/payments");
      } catch (cloudinaryErr) {
        console.error("[Cloudinary] Screenshot upload failed, falling back to local:", cloudinaryErr);
        screenshotUrl = await saveImageLocally(screenshot, "spark/openmic/payments");
      }
    }
  } catch {
    return NextResponse.json({ error: "Failed to upload payment screenshot" }, { status: 400 });
  }

  let scriptUrl: string | null = null;
  if (script instanceof File && script.size > 0) {
    try {
      if (disableCloudinary) {
        scriptUrl = await saveScriptLocally(script, "spark/openmic/scripts");
      } else {
        try {
          scriptUrl = await uploadScriptToCloudinary(script, "spark/openmic/scripts");
        } catch (cloudinaryErr) {
          console.error("[Cloudinary] Script upload failed, falling back to local:", cloudinaryErr);
          scriptUrl = await saveScriptLocally(script, "spark/openmic/scripts");
        }
      }
    } catch {
      return NextResponse.json({ error: "Failed to upload script file" }, { status: 400 });
    }
  }

  const teamMembersArray = parsed.data.teamMembers
    ? parsed.data.teamMembers.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  if (parsed.data.performanceType === "group" && (!teamMembersArray || teamMembersArray.length < 2)) {
    return NextResponse.json(
      { error: "Group performance requires at least 2 team member names" },
      { status: 400 },
    );
  }

  const registration = await prisma.registration.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      performanceType: parsed.data.performanceType,
      performanceTitle: parsed.data.performanceTitle,
      paymentScreenshot: screenshotUrl,
      scriptFile: scriptUrl,
      extraFields: sanitizeJsonInput(dynamicFields) as Prisma.InputJsonValue,
      paymentStatus: "PENDING_REVIEW",
      ...(teamMembersArray ? { teamMembers: teamMembersArray as Prisma.InputJsonValue } : {}),
    },
  });

  const settings = await getPublicSettings();

  if (!disableGmail) {
    try {
      await sendRegistrationEmail(
        {
          id: registration.id,
          name: registration.name,
          email: registration.email,
          performanceType: registration.performanceType,
          performanceTitle: registration.performanceTitle,
          paymentStatus: registration.paymentStatus,
        },
        {
          eventDate: settings.event_date,
          eventVenue: settings.event_venue,
        },
      );

      await prisma.registration.update({
        where: { id: registration.id },
        data: { emailSent: true, emailError: null, emailLastAttempt: new Date() },
      });
    } catch (error) {
      await prisma.registration.update({
        where: { id: registration.id },
        data: { emailSent: false, emailError: getErrorMessage(error), emailLastAttempt: new Date() },
      });
    }
  }

  return NextResponse.json({ success: true, registrationId: registration.id }, { status: 201 });
}
