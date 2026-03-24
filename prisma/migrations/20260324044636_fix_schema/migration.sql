/*
  Warnings:

  - You are about to drop the column `br` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `others` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `tds` on the `PurchaseOrder` table. All the data in the column will be lost.
  - Added the required column `tds` to the `BillingCycle` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerCode` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BillingCycle" ADD COLUMN     "tds" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "customerCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "br",
DROP COLUMN "others",
DROP COLUMN "tds";
