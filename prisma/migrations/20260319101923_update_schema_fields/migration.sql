/*
  Warnings:

  - You are about to drop the column `collectedamount` on the `BillingCycle` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDuedate` on the `BillingCycle` table. All the data in the column will be lost.
  - You are about to drop the column `ageingDate` on the `PurchaseOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BillingCycle" DROP COLUMN "collectedamount",
DROP COLUMN "paymentDuedate",
ADD COLUMN     "collectedAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentDueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "ageingDate",
ADD COLUMN     "ageingDays" TEXT;
