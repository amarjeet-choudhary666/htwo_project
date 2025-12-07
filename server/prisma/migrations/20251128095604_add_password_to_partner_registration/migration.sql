/*
  Warnings:

  - You are about to drop the `Partner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartnerRegistration` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'MONTHLY';

-- DropTable
DROP TABLE "Partner";

-- DropTable
DROP TABLE "PartnerRegistration";

-- CreateTable
CREATE TABLE "PartnerRegistrationForm" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "otherBusinessType" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "countryRegion" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "estimatedMonthlySales" "EstimatedMonthlySales" NOT NULL,
    "hasTechnicalSupport" BOOLEAN NOT NULL,
    "partnershipReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "otp" TEXT,
    "otpExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerRegistrationForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerRegistrationForm_email_key" ON "PartnerRegistrationForm"("email");

-- CreateIndex
CREATE INDEX "PartnerRegistrationForm_email_idx" ON "PartnerRegistrationForm"("email");

-- CreateIndex
CREATE INDEX "PartnerRegistrationForm_status_idx" ON "PartnerRegistrationForm"("status");

-- CreateIndex
CREATE INDEX "PartnerRegistrationForm_createdAt_idx" ON "PartnerRegistrationForm"("createdAt");
