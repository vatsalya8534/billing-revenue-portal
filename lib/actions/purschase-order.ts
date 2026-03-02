"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Status } from "@prisma/client"

/**
 * Create a new Purchase Order
 */
export async function createPurchaseOrder(data: {
  poNumber: string
  serviceType: string
  startFrom: Date
  endDate: Date
  contractType: string
  contractDuration: string
  paymentTerms: string
  billingPlan: string
  poAmount: number
  createdByUserId: number
  remark?: string
}) {
  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      poNumber: data.poNumber,
      serviceType: data.serviceType,
      startFrom: data.startFrom,
      endDate: data.endDate,
      contractType: data.contractType,
      contractDuration: data.contractDuration,
      paymentTerms: data.paymentTerms,
      billingPlan: data.billingPlan,
      poAmount: data.poAmount,
      status: Status.ACTIVE, // default status
      remark: data.remark,
      createdByUserId: data.createdByUserId,
    },
  })

  // Revalidate Next.js cache for purchase orders page
  revalidatePath("/purchase-orders")
  return purchaseOrder
}

/**
 * Get all Purchase Orders
 */
export async function getPurchaseOrders() {
  return prisma.purchaseOrder.findMany({
    orderBy: { createdDate: "desc" },
    include: {
      createdByUser: true,
      bills: true,        
    },
  })
}

/**
 * Get a single Purchase Order by ID
 */
export async function getPurchaseOrderById(id: number) {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      createdByUser: true,
      bills: {
        include: {
          payments: true, 
        },
      },
    },
  })
}

/**
 * Update a Purchase Order
 */
export async function updatePurchaseOrder(
  id: number,
  data: {
    serviceType?: string
    startFrom?: Date
    endDate?: Date
    contractType?: string
    contractDuration?: string
    paymentTerms?: string
    billingPlan?: string
    poAmount?: number
    status?: Status
    remark?: string
  }
) {
  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data,
  })

  revalidatePath("/purchase-orders")
  return updated
}

/**
 * Delete a Purchase Order
 */
export async function deletePurchaseOrder(id: number) {
  await prisma.purchaseOrder.delete({
    where: { id },
  })

  revalidatePath("/purchase-orders")
}