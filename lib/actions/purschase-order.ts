"use server";

import { prisma } from "../prisma";
import { purchaseOrderSchema } from "../validators";
import { formatError } from "../utils";
import { PurchaseOrder } from "@/types";
import { PaymentReceived, Prisma } from "@prisma/client";

// ================= DATE HELPER =================
const toLocalDate = (date?: string | Date | null): Date | undefined => {
  if (!date) return undefined;
  return new Date(typeof date === "string" ? `${date}T00:00:00` : date);
};

// ================= BILLING CYCLE GENERATOR =================
function generateBillingCycles({
  startDate,
  totalCycles,
  type,
}: {
  startDate: Date;
  totalCycles: number;
  type: "START" | "MID" | "END";
}) {
  return Array.from({ length: totalCycles }, (_, i) => {
    const base = new Date(startDate);
    base.setDate(1);

    const date = new Date(base);
    date.setMonth(base.getMonth() + i);

    let finalDate = new Date(date);

    if (type === "START") finalDate.setDate(1);
    if (type === "MID") finalDate.setDate(15);

    if (type === "END") {
      const temp = new Date(date);
      temp.setMonth(temp.getMonth() + 1);
      temp.setDate(0);
      finalDate = temp;
    }

    return {
      invoiceNumber: "",
      invoiceAmount: 0,
      collectedAmount: 0,
      invoiceDate: null,
      billingSubmittedDate: finalDate,
      paymentReceivedDate: null,
      paymentDueDate: null,
      paymentReceived: PaymentReceived.NO,
      billingRemark: "",
      tds: new Prisma.Decimal(0),
    };
  });
}

// ================= GET ALL =================
export async function getPurchaseOrders() {
  try {
    const data = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        billingPlan: true,
        ServiceType: true,
        contractDuration: true,
        contract: true,
        customer: true,
        billingCycles: true,
        company: true,
      },
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], message: formatError(error) };
  }
}

// ================= CREATE =================
export async function createPurchaseOrder(data: PurchaseOrder) {
  try {
    const validated = purchaseOrderSchema.parse(data);

    const billingPlan = await prisma.billingPlan.findUnique({
      where: { id: validated.billingPlanId },
    });

    if (!billingPlan) throw new Error("Billing Plan not found");

    const billingCycles =
      !validated.billingCycles?.length
        ? generateBillingCycles({
          startDate: new Date(validated.startFrom!),
          totalCycles: billingPlan.totalBillingCycles,
          type: billingPlan.billingCycleType as "START" | "MID" | "END",
        })
        : validated.billingCycles.map((bc) => ({
          invoiceNumber: bc.invoiceNumber ?? "",
          invoiceAmount: bc.invoiceAmount ?? 0,
          collectedAmount: bc.collectedAmount ?? 0,
          invoiceDate: toLocalDate(bc.invoiceDate),
          billingSubmittedDate: toLocalDate(bc.billingSubmittedDate),
          paymentReceivedDate: toLocalDate(bc.paymentReceivedDate),
          paymentDueDate: toLocalDate(bc.paymentDueDate),
          paymentReceived: bc.paymentReceived,
          billingRemark: bc.billingRemark ?? "",
          tds: new Prisma.Decimal(bc.tds ?? 0),
        }));

    await prisma.purchaseOrder.create({
      data: {
        customerPONumber: validated.customerPONumber,
        poAmount: validated.poAmount,
        serviceTypeId: validated.serviceTypeId,
        contractDurationId: validated.contractDurationId,
        contractId: validated.contractId,
        startFrom: toLocalDate(validated.startFrom),
        endDate: toLocalDate(validated.endDate),
        companyId: validated.companyId ?? null,
        paymentTerms: validated.paymentTerms,
        customerId: validated.customerId,
        billingPlanId: validated.billingPlanId,
        poOwner: validated.poOwner,
        status: validated.status,
        ageingDays: validated.ageingDays?.toString() ?? null,
        remark: validated.remark ?? "",
        scope: validated.scope ?? "",
        billingCycles: {
          create: billingCycles,
        },
      },
    });

    return { success: true, message: "Purchase Order created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ================= GET BY ID =================
export async function getPurchaseOrderById(id: string) {
  try {
    const data = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        ServiceType: true,
        billingPlan: true,
        contractDuration: true,
        contract: true,
        customer: true,
        billingCycles: true,
        company: true,
      },
    });

    if (!data) return { success: false };

    return { success: true, data };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ================= UPDATE =================
export async function updatePurchaseOrder(
  data: PurchaseOrder,
  id: string
) {
  try {
    const validated = purchaseOrderSchema.parse(data);

    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        customerPONumber: validated.customerPONumber,
        poAmount: validated.poAmount,
        serviceTypeId: validated.serviceTypeId,
        contractDurationId: validated.contractDurationId,
        contractId: validated.contractId,
        startFrom: toLocalDate(validated.startFrom),
        endDate: toLocalDate(validated.endDate),
        companyId: validated.companyId ?? null,
        paymentTerms: validated.paymentTerms,
        customerId: validated.customerId,
        billingPlanId: validated.billingPlanId,
        poOwner: validated.poOwner,
        status: validated.status,
        ageingDays: validated.ageingDays?.toString() ?? null,
        remark: validated.remark ?? "",
        scope: validated.scope ?? "",

        billingCycles: {
          deleteMany: {},
          create:
            validated.billingCycles?.map((bc) => ({
              invoiceNumber: bc.invoiceNumber ?? "",
              invoiceAmount: bc.invoiceAmount ?? 0,
              collectedAmount: bc.collectedAmount ?? 0,
              invoiceDate: toLocalDate(bc.invoiceDate),
              billingSubmittedDate: toLocalDate(bc.billingSubmittedDate),
              paymentReceivedDate: toLocalDate(bc.paymentReceivedDate),
              paymentDueDate: toLocalDate(bc.paymentDueDate),
              paymentReceived: bc.paymentReceived,
              billingRemark: bc.billingRemark ?? "",
              tds: new Prisma.Decimal(bc.tds ?? 0),
            })) ?? [],
        },
      },
    });

    return { success: true, message: "Purchase Order updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ================= DELETE =================
export async function deletePurchaseOrder(id: string) {
  try {
    await prisma.$transaction([
      prisma.billingCycle.deleteMany({
        where: { purchaseOrderId: id },
      }),
      prisma.purchaseOrder.delete({
        where: { id },
      }),
    ]);

    return {
      success: true,
      message: "Purchase Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// ================= GET BILLING CYCLES =================
export async function getBillingCyclesByPOID(id: string) {
  try {
    const data = await prisma.billingCycle.findMany({
      where: { purchaseOrderId: id },
      orderBy: { billingSubmittedDate: "asc" },
    });

    return {
      success: true,
      data,
      message: "Billing Cycles fetched successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}