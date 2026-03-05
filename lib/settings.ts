import { prisma } from "@/lib/prisma";
import { PublicSettings } from "@/types";

const defaults: PublicSettings = {
  upi_qr_url: "",
  upi_id: "",
  payment_amount: "0",
  form_fields: [],
  event_date: "TBD",
  event_venue: "TBD",
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
    "payment_amount",
    "form_fields",
    "event_date",
    "event_venue",
  ];

  const entries = await Promise.all(keys.map(async (key) => [key, await getSetting(key)] as const));

  return Object.fromEntries(entries) as PublicSettings;
}
