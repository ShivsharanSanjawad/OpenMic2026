-- Remove duration field from registrations
ALTER TABLE "Registration" DROP COLUMN IF EXISTS "duration";

-- Move any legacy duo entries before enum replacement
UPDATE "Registration"
SET "performanceType" = 'group'
WHERE "performanceType" = 'duo';

-- Replace enum to remove duo value
CREATE TYPE "PerformanceType_new" AS ENUM ('solo', 'group');

ALTER TABLE "Registration"
ALTER COLUMN "performanceType" TYPE "PerformanceType_new"
USING ("performanceType"::text::"PerformanceType_new");

DROP TYPE "PerformanceType";
ALTER TYPE "PerformanceType_new" RENAME TO "PerformanceType";

-- Remove unused settings key
DELETE FROM "SiteSettings"
WHERE "key" = 'payment_amount_duo';