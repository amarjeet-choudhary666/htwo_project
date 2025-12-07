-- AlterTable
ALTER TABLE "PartnerRegistrationForm" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpires" TIMESTAMP(3);
