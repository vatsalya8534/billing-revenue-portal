/*
  Warnings:

  - You are about to drop the column `billDate` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `billSubmittedDate` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `billingNumber` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `billingPlan` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `contractType` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReceived` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReceivedAmount` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReceivedDate` on the `PurchaseOrder` table. All the data in the column will be lost.
  - Added the required column `contractId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poOwner` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "billDate",
DROP COLUMN "billSubmittedDate",
DROP COLUMN "billingNumber",
DROP COLUMN "billingPlan",
DROP COLUMN "contractType",
DROP COLUMN "customerName",
DROP COLUMN "paymentReceived",
DROP COLUMN "paymentReceivedAmount",
DROP COLUMN "paymentReceivedDate",
ADD COLUMN     "billingPlanId" UUID,
ADD COLUMN     "contractId" UUID NOT NULL,
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "poOwner" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BillingCycle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "billingAmount" DOUBLE PRECISION,
    "billingDate" TIMESTAMP(3),
    "billingSubmittedDate" TIMESTAMP(3),
    "paymentReceived" "PaymentReceived" NOT NULL DEFAULT 'NO',
    "paymentReceivedDate" TIMESTAMP(3),
    "paymentReceivedAmount" DOUBLE PRECISION,
    "billingRemark" TEXT,
    "purchaseOrderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPlan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "totalBillingCycles" INTEGER NOT NULL,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractType" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customerCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "website" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_name_key" ON "ServiceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlan_name_key" ON "BillingPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContractType_name_key" ON "ContractType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_gstNumber_key" ON "Customer"("gstNumber");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ContractType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_billingPlanId_fkey" FOREIGN KEY ("billingPlanId") REFERENCES "BillingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingCycle" ADD CONSTRAINT "BillingCycle_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
