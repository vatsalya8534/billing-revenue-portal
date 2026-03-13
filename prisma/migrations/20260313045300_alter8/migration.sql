/*
  Warnings:

  - Made the column `customerId` on table `PurchaseOrder` required. This step will fail if there are existing NULL values in that column.
  - Made the column `billingPlanId` on table `PurchaseOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_billingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_customerId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" ALTER COLUMN "customerId" SET NOT NULL,
ALTER COLUMN "billingPlanId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_billingPlanId_fkey" FOREIGN KEY ("billingPlanId") REFERENCES "BillingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
