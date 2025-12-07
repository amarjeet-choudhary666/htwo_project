/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `ServiceRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_invoiceId_key" ON "ServiceRequest"("invoiceId");

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
