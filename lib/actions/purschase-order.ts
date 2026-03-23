"use server";

import { prisma } from "../prisma";
import { purchaseOrderSchema } from "../validators";
import { formatError } from "../utils";
import { PurchaseOrder } from "@/types";

const toLocalDate = (date?: string | Date | null) => {
  if (!date) return undefined;
  return new Date(
    typeof date === "string" ? date + "T00:00:00" : date
  );
};

// ---------------- GET ALL ----------------
export async function getPurchaseOrders() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        billingPlan: true,
        ServiceType: true,
        contractDuration: true,
        contract: true,
        customer: true,
        billingCycles: true,
      },
    });

    return { success: true, data: purchaseOrders ?? [] };
  } catch (error) {
    return { success: false, data: [], message: formatError(error) };
  }
}

// ---------------- CREATE ----------------
export async function createPurchaseOrder(data: PurchaseOrder) {
  try {
    const validatedData = purchaseOrderSchema.parse(data);

    await prisma.purchaseOrder.create({
      data: {
        customerPONumber: validatedData.customerPONumber,
        poAmount: validatedData.poAmount,
        serviceTypeId: validatedData.serviceTypeId,
        contractDurationId: validatedData.contractDurationId,
        contractId: validatedData.contractId,

        startFrom: toLocalDate(validatedData.startFrom),
        endDate: toLocalDate(validatedData.endDate),
        br: toLocalDate(validatedData.br),

        paymentTerms: validatedData.paymentTerms,
        customerId: validatedData.customerId,
        billingPlanId: validatedData.billingPlanId,
        poOwner: validatedData.poOwner,
        status: validatedData.status,

        ageingDays:
          validatedData.ageingDays !== undefined
            ? String(validatedData.ageingDays)
            : null,

        remark: validatedData.remark ?? "",
        others: validatedData.others ?? "",
        scope: validatedData.scope ?? "",
        tds: validatedData.tds ?? "",

        billingCycles: {
          create: validatedData.billingCycles?.map((bc) => ({
            invoiceNumber: bc.invoiceNumber ?? "",
            invoiceAmount: bc.invoiceAmount ?? 0,
            collectedAmount: bc.collectedAmount ?? 0,

            invoiceDate: toLocalDate(bc.invoiceDate),
            billingSubmittedDate: toLocalDate(bc.billingSubmittedDate),
            paymentReceivedDate: toLocalDate(bc.paymentReceivedDate),
            paymentDueDate: toLocalDate(bc.paymentDueDate),

            paymentReceived: bc.paymentReceived,
            billingRemark: bc.billingRemark ?? "",
          })),
        },
      },
    });

    return { success: true, message: "Purchase Order created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ---------------- GET BY ID ----------------
export async function getPurchaseOrderById(id: string) {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        ServiceType: true,
        billingPlan: true,
        contractDuration: true,
        contract: true,
        customer: true,
        billingCycles: true,
      },
    });

    if (!po) return { success: false };

    return { success: true, data: po };
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

// ---------------- UPDATE ----------------
export async function updatePurchaseOrder(
  data: PurchaseOrder,
  id: string
) {
  try {
    const validatedData = purchaseOrderSchema.parse(data);

    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        customerPONumber: validatedData.customerPONumber,
        poAmount: validatedData.poAmount,
        serviceTypeId: validatedData.serviceTypeId,
        contractDurationId: validatedData.contractDurationId,
        contractId: validatedData.contractId,

        startFrom: toLocalDate(validatedData.startFrom),
        endDate: toLocalDate(validatedData.endDate),
        br: toLocalDate(validatedData.br),

        paymentTerms: validatedData.paymentTerms,
        customerId: validatedData.customerId,
        billingPlanId: validatedData.billingPlanId,
        poOwner: validatedData.poOwner,
        status: validatedData.status,

        ageingDays:
          validatedData.ageingDays !== undefined
            ? String(validatedData.ageingDays)
            : null,

        remark: validatedData.remark ?? "",
        others: validatedData.others ?? "",
        scope: validatedData.scope ?? "",
        tds: validatedData.tds ?? "",

        billingCycles: {
          deleteMany: {},
          create: validatedData.billingCycles?.map((bc) => ({
            invoiceNumber: bc.invoiceNumber ?? "",
            invoiceAmount: bc.invoiceAmount ?? 0,
            collectedAmount: bc.collectedAmount ?? 0,

            invoiceDate: toLocalDate(bc.invoiceDate),
            billingSubmittedDate: toLocalDate(bc.billingSubmittedDate),
            paymentReceivedDate: toLocalDate(bc.paymentReceivedDate),
            paymentDueDate: toLocalDate(bc.paymentDueDate),

            paymentReceived: bc.paymentReceived,
            billingRemark: bc.billingRemark ?? "",
          })),
        },
      },
    });

    return { success: true, message: "Purchase Order updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ---------------- DELETE ----------------
export async function deletePurchaseOrder(id: string) {
  try {
    await prisma.billingCycle.deleteMany({
      where: { purchaseOrderId: id },
    });

    await prisma.purchaseOrder.delete({ where: { id } });

    return {
      success: true,
      message: "Purchase Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ---------------- GET BILLING CYCLES ----------------
export async function getBillingCyclesByPOID(id: string) {
  try {
    const billingCycles = await prisma.billingCycle.findMany({
      where: { purchaseOrderId: id },
    });

    return {
      success: true,
      data: billingCycles,
      message: "Billing Cycles fetched successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}