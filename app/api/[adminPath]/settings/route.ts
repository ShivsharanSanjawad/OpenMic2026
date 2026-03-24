import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { saveImageLocally } from "@/lib/local-upload";
import { getAdminFromCookie } from "@/lib/auth";
import { getPublicSettings, setSetting } from "@/lib/settings";
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

  const settings = await getPublicSettings();
  return NextResponse.json({ settings });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ adminPath: string }> },
) {
  const disableCloudinary = process.env.DISABLE_CLOUDINARY === "true";

  const { adminPath } = await params;
  if (!(await guard(adminPath))) return notFound();
  if (!assertAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const formData = await request.formData();

  const upiId = sanitizeText(formData.get("upi_id"), 120);
  const paymentAmountSolo  = sanitizeText(formData.get("payment_amount_solo"),  20);
  const paymentAmountGroup = sanitizeText(formData.get("payment_amount_group"), 20);
  const eventDate = sanitizeText(formData.get("event_date"), 120);
  const eventVenue = sanitizeText(formData.get("event_venue"), 180);
  const formFieldsRaw = sanitizeText(formData.get("form_fields"), 4000);
  const registrationsOpen = formData.get("registrations_open");
  const legacy10YearEnabled = formData.get("legacy_10_year_enabled");
  const qrImage = formData.get("qrImage");

  if (upiId) await setSetting("upi_id", upiId);
  if (paymentAmountSolo)  await setSetting("payment_amount_solo",  paymentAmountSolo);
  if (paymentAmountGroup) await setSetting("payment_amount_group", paymentAmountGroup);
  if (eventDate) await setSetting("event_date", eventDate);
  if (eventVenue) await setSetting("event_venue", eventVenue);
  if (formFieldsRaw) await setSetting("form_fields", formFieldsRaw);
  // registrations_open can be "true" or "false" — always update when field is present
  if (registrationsOpen !== null && registrationsOpen !== undefined) {
    await setSetting("registrations_open", registrationsOpen === "true" ? "true" : "false");
  }
  if (legacy10YearEnabled !== null && legacy10YearEnabled !== undefined) {
    await setSetting("legacy_10_year_enabled", legacy10YearEnabled === "true" ? "true" : "false");
  }

  if (qrImage instanceof File && qrImage.size > 0) {
    if (!qrImage.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    try {
      const qrUrl = disableCloudinary
        ? await saveImageLocally(qrImage, "spark/openmic/qr")
        : await uploadImageToCloudinary(qrImage, "spark/openmic/qr").catch(async () =>
            saveImageLocally(qrImage, "spark/openmic/qr"),
          );
      await setSetting("upi_qr_url", qrUrl);
    } catch {
      return NextResponse.json({ error: "Failed to upload QR image" }, { status: 400 });
    }
  }

  const settings = await getPublicSettings();
  return NextResponse.json({ success: true, settings });
}
