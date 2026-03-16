/*
  Warnings:

  - You are about to drop the column `contractDuration` on the `PurchaseOrder` table. All the data in the column will be lost.
  - Added the required column `contractDurationId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "contractDuration",
ADD COLUMN     "contractDurationId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "ContractDuration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "totalNumberOfMonths" INTEGER NOT NULL,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractDuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContractDuration_name_key" ON "ContractDuration"("name");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_contractDurationId_fkey" FOREIGN KEY ("contractDurationId") REFERENCES "ContractDuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
