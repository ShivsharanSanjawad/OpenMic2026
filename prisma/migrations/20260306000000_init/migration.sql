-- CreateEnum
CREATE TYPE "PerformanceType" AS ENUM ('solo', 'duo', 'group');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_REVIEW', 'PENDING_CORRECTION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'SHORTLIST', 'SCHEDULE', 'RESULT', 'IMPORTANT');

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "college" TEXT,
    "performanceType" "PerformanceType" NOT NULL,
    "performanceTitle" TEXT,
    "duration" TEXT,
    "teamMembers" JSONB,
    "paymentScreenshot" TEXT NOT NULL,
    "extraFields" JSONB,
    "userId" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "scriptFile" TEXT,
    "adminComment" TEXT,
    "emailError" TEXT,
    "emailLastAttempt" TIMESTAMP(3),
    "requiresReupload" BOOLEAN NOT NULL DEFAULT false,
    "allowedCorrectionFields" JSONB,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminComment" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL,
    "requiresReupload" BOOLEAN NOT NULL DEFAULT false,
    "allowedFields" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Registration_email_idx" ON "Registration"("email");

-- CreateIndex
CREATE INDEX "Registration_createdAt_idx" ON "Registration"("createdAt");

-- CreateIndex
CREATE INDEX "Registration_paymentStatus_idx" ON "Registration"("paymentStatus");

-- CreateIndex
CREATE INDEX "AdminComment_registrationId_idx" ON "AdminComment"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_key_key" ON "SiteSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminComment" ADD CONSTRAINT "AdminComment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
