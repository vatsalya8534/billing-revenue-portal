/*
  Warnings:

  - You are about to drop the column `clientId` on the `PurchaseOrder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_clientId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "clientId";
