/*
  Warnings:

  - The values [ACTIVE,INACTIVE,PENDING] on the enum `POStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `billingAmount` on the `BillingCycle` table. All the data in the column will be lost.
  - You are about to drop the column `billingDate` on the `BillingCycle` table. All the data in the column will be lost.
  - You are about to drop the column `billingNumber` on the `BillingCycle` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReceivedAmount` on the `BillingCycle` table. All the data in the column will be lost.
  - Added the required column `invoiceNumber` to the `BillingCycle` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerCode` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `others` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tds` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "POStatus_new" AS ENUM ('LIVE', 'CLOSED');
ALTER TABLE "public"."PurchaseOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" TYPE "POStatus_new" USING ("status"::text::"POStatus_new");
ALTER TYPE "POStatus" RENAME TO "POStatus_old";
ALTER TYPE "POStatus_new" RENAME TO "POStatus";
DROP TYPE "public"."POStatus_old";
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" SET DEFAULT 'LIVE';
COMMIT;

-- AlterTable
ALTER TABLE "BillingCycle" DROP COLUMN "billingAmount",
DROP COLUMN "billingDate",
DROP COLUMN "billingNumber",
DROP COLUMN "paymentReceivedAmount",
ADD COLUMN     "collectedAmount" DOUBLE PRECISION,
ADD COLUMN     "invoiceAmount" DOUBLE PRECISION,
ADD COLUMN     "invoiceDate" TIMESTAMP(3),
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "paymentDueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "customerCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "ageingDays" TEXT,
ADD COLUMN     "br" TIMESTAMP(3),
ADD COLUMN     "others" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "tds" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'LIVE';
