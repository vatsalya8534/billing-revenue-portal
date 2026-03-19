"use server";

import { BillingCycle, PurchaseOrder } from "@/types";
import { prisma } from "../prisma";
import { purchaseOrderSchema } from "../validators";
import { formatError } from "../utils";

export async function getPurchaseOrders() {
  return await prisma.purchaseOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      billingPlan: true,
      ServiceType: true,
      contractDuration: true,
      contract: true,
      customer: true,
      billingCycles: true,
    },
  });
}

export async function createPurchaseOrder(data: PurchaseOrder) {

  try {
    const purchaseOrder = purchaseOrderSchema.parse(data)

    const purchaseOrderData = await prisma.purchaseOrder.create({
      data: {
        customerPONumber: purchaseOrder.customerPONumber,
        poAmount: purchaseOrder.poAmount,
        serviceTypeId: purchaseOrder.serviceTypeId,
        contractDurationId: purchaseOrder.contractDurationId,
        contractId: purchaseOrder.contractId,
        startFrom: purchaseOrder.startFrom ? new Date(purchaseOrder.startFrom) : undefined,
        endDate: purchaseOrder.endDate ? new Date(purchaseOrder.endDate) : undefined,
        paymentTerms: purchaseOrder.paymentTerms,
        customerId: purchaseOrder.customerId,
        billingPlanId: purchaseOrder.billingPlanId,
        status: purchaseOrder.status,
        remark: purchaseOrder.remark,
        poOwner: purchaseOrder.poOwner,
      }
    })

    await createBillingCycle(purchaseOrder.billingCycle, purchaseOrderData.id)

    return {
      success: true,
      message: "Purchase Order created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function getPurchaseOrderById(id: string) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
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

    if (purchaseOrder) {
      return {
        success: true,
        data: purchaseOrder,
        message: "Purchase Order fetched successfully",
      };
    }

    return {
      success: false,
      message: "Purchase Order not found",
    };

  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}


export async function updatePurchaseOrder(data: PurchaseOrder, id: string) {
  try {

    const purchaseOrder = purchaseOrderSchema.parse(data)

    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        customerPONumber: purchaseOrder.customerPONumber,
        poAmount: purchaseOrder.poAmount,
        serviceTypeId: purchaseOrder.serviceTypeId,
        contractDurationId: purchaseOrder.contractDurationId,

        contractId: purchaseOrder.contractId,
        startFrom: purchaseOrder.startFrom ? new Date(purchaseOrder.startFrom) : undefined,
        endDate: purchaseOrder.endDate ? new Date(purchaseOrder.endDate) : undefined,

        customerId: purchaseOrder.customerId,
        paymentTerms: purchaseOrder.paymentTerms,
        billingPlanId: purchaseOrder.billingPlanId,
        status: purchaseOrder.status,
        remark: purchaseOrder.remark,
        poOwner: purchaseOrder.poOwner,
      }
    })

    createBillingCycle(purchaseOrder.billingCycle, id)

    return {
      success: true,
      message: "Purchase Order updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deletePurchaseOrder(id: any) {
  try {
    await prisma.purchaseOrder.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Purhase Order deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function getBillingCyclesByPOID(id: string) {
  try {

    let billingCycles = await prisma.billingCycle.findMany({
      where: {
        purchaseOrderId: id
      }
    })

    if (billingCycles) {
      return {
        success: true,
        data: billingCycles,
        message: "Purchase Order fetched successfully"
      }
    }

    return {
      success: false,
      message: "Purchase Order not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

async function createBillingCycle(data: BillingCycle[], id: string) {

  try {
    await prisma.billingCycle.deleteMany({
      where: {
        purchaseOrderId: id
      }
    })

    for (const billingCycle of data) {
      await prisma.billingCycle.create({
        data: {
          billingNumber: billingCycle.billingNumber,
          billingAmount: billingCycle.billingAmount,
          billingDate: billingCycle.billingDate ? new Date(billingCycle.billingDate) : undefined,
          billingSubmittedDate: billingCycle.billingSubmittedDate ? new Date(billingCycle.billingSubmittedDate) : undefined,
          paymentReceived: billingCycle.paymentReceived,
          paymentReceivedDate: billingCycle.paymentReceivedDate ? new Date(billingCycle.paymentReceivedDate) : undefined,
          paymentReceivedAmount: billingCycle.paymentReceivedAmount,
          billingRemark: billingCycle.billingRemark,
          purchaseOrderId: id
        }
      })
    }

    return {
      success: true,
      message: "Billing Cycle created successfully"
    }

  } catch (error) {

    return {
      success: false,
      message: formatError(error)
    }
  }
}

