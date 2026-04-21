-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectedProfit" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProjectMonthlyPL" ADD COLUMN     "billableAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "resourceUsed" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Configuration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "logo" TEXT,
    "favicon" TEXT,
    "email" TEXT,
    "password" TEXT,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);
