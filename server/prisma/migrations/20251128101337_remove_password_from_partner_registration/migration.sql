/*
  Warnings:

  - You are about to drop the column `otp` on the `PartnerRegistrationForm` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpires` on the `PartnerRegistrationForm` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `PartnerRegistrationForm` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `PartnerRegistrationForm` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `PartnerRegistrationForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PartnerRegistrationForm" DROP COLUMN "otp",
DROP COLUMN "otpExpires",
DROP COLUMN "password",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry";
