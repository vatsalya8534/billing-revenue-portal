/*
  Warnings:

  - The `billingCycleType` column on the `BillingPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BillingCycleType" AS ENUM ('START', 'MID', 'END');

-- AlterTable
ALTER TABLE "BillingPlan" DROP COLUMN "billingCycleType",
ADD COLUMN     "billingCycleType" "BillingCycleType" NOT NULL DEFAULT 'START';
