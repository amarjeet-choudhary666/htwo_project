/*
  Warnings:

  - Added the required column `companyName` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Partner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "agreementDate" TIMESTAMP(3),
ADD COLUMN     "agreementPdfUrl" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "countryRegion" TEXT,
ADD COLUMN     "currentPartners" TEXT,
ADD COLUMN     "estimatedMonthlyVpsSales" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "handlesBilling" BOOLEAN DEFAULT false,
ADD COLUMN     "hasTechnicalSupport" BOOLEAN DEFAULT false,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "numberOfEmployees" INTEGER,
ADD COLUMN     "partnershipReason" TEXT,
ADD COLUMN     "preferredPartnershipType" TEXT,
ADD COLUMN     "signature" TEXT,
ADD COLUMN     "yearEstablished" INTEGER,
ALTER COLUMN "name" DROP NOT NULL;
