-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "acronisFolderLocation" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "partner" TEXT NOT NULL DEFAULT 'htwo';
