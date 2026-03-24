import { prisma } from "@/lib/prisma";
import { PublicSettings } from "@/types";

const defaults: PublicSettings = {
  upi_qr_url: "",
  upi_id: "",
  payment_amount_solo: "100",
  payment_amount_group: "150",
  form_fields: [],
  event_date: "TBD",
  event_venue: "TBD",
  registrations_open: "true",
  legacy_10_year_enabled: "false",
};

export async function getSetting(key: keyof PublicSettings) {
  const item = await prisma.siteSettings.findUnique({ where: { key } });
  if (!item) return defaults[key];
  if (key === "form_fields") {
    try {
      return JSON.parse(item.value);
    } catch {
      return [];
    }
  }
  return item.value;
}

export async function setSetting(key: keyof PublicSettings, value: string) {
  return prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const keys: Array<keyof PublicSettings> = [
    "upi_qr_url",
    "upi_id",
    "payment_amount_solo",
    "payment_amount_group",
    "form_fields",
    "event_date",
    "event_venue",
    "registrations_open",
    "legacy_10_year_enabled",
  ];

  const entries = await Promise.all(keys.map(async (key) => [key, await getSetting(key)] as const));

  const result = Object.fromEntries(entries) as PublicSettings;
  // Ensure form_fields is always a proper array, never undefined
  if (!Array.isArray(result.form_fields)) result.form_fields = [];
  return result;
}
