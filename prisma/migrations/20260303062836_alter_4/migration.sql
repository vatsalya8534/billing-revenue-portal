/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `poNumber` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the `Bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerPONumber` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentReceivedAmount` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_poId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_billId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdByUserId_fkey";

-- DropIndex
DROP INDEX "PurchaseOrder_poNumber_key";

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "createdByUserId",
DROP COLUMN "poNumber",
ADD COLUMN     "billDate" TIMESTAMP(3),
ADD COLUMN     "billSubmittedDate" TIMESTAMP(3),
ADD COLUMN     "billingNumber" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPONumber" TEXT NOT NULL,
ADD COLUMN     "paymentReceived" "PaymentReceived" NOT NULL DEFAULT 'NO',
ADD COLUMN     "paymentReceivedAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentReceivedDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "Bill";

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Payment";
