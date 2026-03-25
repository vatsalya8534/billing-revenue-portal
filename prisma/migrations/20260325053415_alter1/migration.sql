/*
  Warnings:

  - You are about to drop the column `spareParts` on the `ProjectMonthlyPL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProjectMonthlyPL" DROP COLUMN "spareParts",
ADD COLUMN     "spare" DECIMAL(12,2) NOT NULL DEFAULT 0;
