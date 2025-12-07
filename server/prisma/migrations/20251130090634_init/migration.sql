/*
  Warnings:

  - You are about to drop the column `vpsPlan` on the `ServiceRequest` table. All the data in the column will be lost.
  - Added the required column `servicePlan` to the `ServiceRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceRequest" DROP COLUMN "vpsPlan",
ADD COLUMN     "servicePlan" TEXT NOT NULL,
ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'CLOUD';
