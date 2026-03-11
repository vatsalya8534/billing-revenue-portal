/*
  Warnings:

  - Added the required column `billingNumber` to the `BillingCycle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BillingCycle" ADD COLUMN     "billingNumber" TEXT NOT NULL;
