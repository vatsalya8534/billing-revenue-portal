"use server";

import { prisma } from "../prisma";
import { purchaseOrderSchema } from "../validators";
import { formatError } from "../utils";
import { PurchaseOrder } from "@/types";
import { PaymentReceived } from "@prisma/client";

// ---------------- DATE HELPER ----------------
const toLocalDate = (date?: string | Date | null) => {
  if (!date) return undefined;
  return new Date(typeof date === "string" ? date + "T00:00:00" : date);
};

// ---------------- BILLING CYCLE GENERATOR ----------------
function generateBillingCycles({
  startDate,
  totalCycles,
  type,
}: {
  startDate: Date;
  totalCycles: number;
  type: "START" | "MID" | "END";
}) {
  const cycles = [];

  for (let i = 0; i < totalCycles; i++) {
    // ✅ ALWAYS create fresh base date
    const base = new Date(startDate);
    base.setDate(1); // prevent overflow issues

    // ✅ add months safely
    const date = new Date(base);
    date.setMonth(base.getMonth() + i);

    let finalDate = new Date(date);

    if (type === "START") {
      finalDate.setDate(1);
    }

    if (type === "MID") {
      finalDate.setDate(15);
    }

    if (type === "END") {
      // go to next month then step back 1 day
      const temp = new Date(date);
      temp.setMonth(temp.getMonth() + 1);
      temp.setDate(0);
      finalDate = temp;
    }

    cycles.push({
      invoiceNumber: "",
      invoiceAmount: 0,
      collectedAmount: 0,
      invoiceDate: null,
      billingSubmittedDate: finalDate,
      paymentReceivedDate: null,
      paymentDueDate: null,
      paymentReceived: PaymentReceived.NO,
      billingRemark: "",
      tds: "",
    });
  }

  return cycles;
}

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

    // 🔥 GET BILLING PLAN
    const billingPlan = await prisma.billingPlan.findUnique({
      where: { id: validatedData.billingPlanId },
    });

    if (!billingPlan) {
      throw new Error("Billing Plan not found");
    }

    // 🔥 AUTO GENERATE IF EMPTY
    const autoCycles =
      !validatedData.billingCycles || validatedData.billingCycles.length === 0
        ? generateBillingCycles({
            startDate: new Date(validatedData.startFrom!),
            totalCycles: billingPlan.totalBillingCycles,
            type: billingPlan.billingCycleType as "START" | "MID" | "END",
          })
        : validatedData.billingCycles.map((bc) => ({
            invoiceNumber: bc.invoiceNumber ?? "",
            invoiceAmount: bc.invoiceAmount ?? 0,
            collectedAmount: bc.collectedAmount ?? 0,
            invoiceDate: toLocalDate(bc.invoiceDate),
            billingSubmittedDate: toLocalDate(bc.billingSubmittedDate),
            paymentReceivedDate: toLocalDate(bc.paymentReceivedDate),
            paymentDueDate: toLocalDate(bc.paymentDueDate),
            paymentReceived: bc.paymentReceived,
            billingRemark: bc.billingRemark ?? "",
            tds: bc.tds ?? "",
          }));

    await prisma.purchaseOrder.create({
      data: {
        customerPONumber: validatedData.customerPONumber,
        poAmount: validatedData.poAmount,
        serviceTypeId: validatedData.serviceTypeId,
        contractDurationId: validatedData.contractDurationId,
        contractId: validatedData.contractId,

        startFrom: toLocalDate(validatedData.startFrom),
        endDate: toLocalDate(validatedData.endDate),


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
        scope: validatedData.scope ?? "",


        billingCycles: {
          create: autoCycles,
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
        scope: validatedData.scope ?? "",

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
            tds: bc.tds ?? "",
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