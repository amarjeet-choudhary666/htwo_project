-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('RESELLER', 'IT_CONSULTANT', 'HOSTING_PROVIDER', 'OTHER');

-- CreateEnum
CREATE TYPE "EstimatedMonthlySales" AS ENUM ('LESS_THAN_10', 'BETWEEN_10_50', 'BETWEEN_51_200', 'MORE_THAN_200');

-- CreateTable
CREATE TABLE "PartnerRegistration" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "otherBusinessType" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "countryRegion" TEXT NOT NULL,
    "estimatedMonthlySales" "EstimatedMonthlySales" NOT NULL,
    "hasTechnicalSupport" BOOLEAN NOT NULL,
    "partnershipReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerRegistration_email_key" ON "PartnerRegistration"("email");

-- CreateIndex
CREATE INDEX "PartnerRegistration_email_idx" ON "PartnerRegistration"("email");

-- CreateIndex
CREATE INDEX "PartnerRegistration_status_idx" ON "PartnerRegistration"("status");

-- CreateIndex
CREATE INDEX "PartnerRegistration_createdAt_idx" ON "PartnerRegistration"("createdAt");
