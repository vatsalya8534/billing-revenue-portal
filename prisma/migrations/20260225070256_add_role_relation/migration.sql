/*
  Warnings:

  - You are about to drop the column `endFrom` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `personName` on the `User` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "endFrom",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "personName",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
