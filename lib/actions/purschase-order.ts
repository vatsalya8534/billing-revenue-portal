"use server";

import { PurchaseOrder } from "@/types";
import { prisma } from "../prisma";
import { purchaseOrderSchema } from "../validators";
import { formatError } from "../utils";

export async function getPurchaseOrders() {
  return await prisma.purchaseOrder.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function createPurchaseOrder(data: PurchaseOrder) {

  try {
    const purchaseOrder = purchaseOrderSchema.parse(data)

    await prisma.purchaseOrder.create({
      data: {
        customerPONumber: purchaseOrder.customerPONumber,
        poAmount: purchaseOrder.poAmount,
        serviceType: purchaseOrder.serviceType,
        contractDuration: purchaseOrder.contractDuration,

        contractType: purchaseOrder.contractType,
        startFrom: purchaseOrder.startFrom,
        endDate: purchaseOrder.endDate,
        paymentTerms: purchaseOrder.paymentTerms,
        billingPlan: purchaseOrder.billingPlan,

        billingNumber: purchaseOrder.billingNumber,
        customerName: purchaseOrder.customerName,
        billDate: purchaseOrder.billDate,
        billSubmittedDate: purchaseOrder.billSubmittedDate,
        paymentReceived: purchaseOrder.paymentReceived,
        paymentReceivedDate: purchaseOrder.paymentReceivedDate,
        paymentReceivedAmount: purchaseOrder.paymentReceivedAmount,

        status: purchaseOrder.status,
        remark: purchaseOrder.remark,
      }
    })

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

    let purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id }
    })

    if (purchaseOrder) {
      return {
        success: true,
        data: purchaseOrder,
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


export async function updatePurchaseOrder(data: PurchaseOrder, id: string) {
  try {

    const purchaseOrder = purchaseOrderSchema.parse(data)

    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        customerPONumber: purchaseOrder.customerPONumber,
        poAmount: purchaseOrder.poAmount,
        serviceType: purchaseOrder.serviceType,
        contractDuration: purchaseOrder.contractDuration,

        contractType: purchaseOrder.contractType,
        startFrom: purchaseOrder.startFrom,
        endDate: purchaseOrder.endDate,
        paymentTerms: purchaseOrder.paymentTerms,
        billingPlan: purchaseOrder.billingPlan,

        billingNumber: purchaseOrder.billingNumber,
        customerName: purchaseOrder.customerName,
        billDate: purchaseOrder.billDate,
        billSubmittedDate: purchaseOrder.billSubmittedDate,
        paymentReceived: purchaseOrder.paymentReceived,
        paymentReceivedDate: purchaseOrder.paymentReceivedDate,
        paymentReceivedAmount: purchaseOrder.paymentReceivedAmount,

        status: purchaseOrder.status,
        remark: purchaseOrder.remark,
      }
    })

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