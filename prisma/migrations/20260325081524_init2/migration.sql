/*
  Warnings:

  - The `tds` column on the `BillingCycle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BillingCycle" DROP COLUMN "tds",
ADD COLUMN     "tds" DECIMAL(12,2) NOT NULL DEFAULT 0;
