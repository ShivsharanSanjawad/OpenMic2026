import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be provided");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: {
      passwordHash,
    },
    create: {
      username,
      passwordHash,
    },
  });

  const defaultSettings = [
    { key: "upi_qr_url", value: "" },
    { key: "upi_id", value: "" },
    { key: "payment_amount", value: "0" },
    { key: "form_fields", value: "[]" },
    { key: "event_date", value: "TBD" },
    { key: "event_venue", value: "TBD" },
  ];

  for (const item of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
