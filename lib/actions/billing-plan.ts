"use server";

import { Role } from "@/types";
import { prisma } from "../prisma";
import { billingPlanSchema, contractTypeSchema } from "../validators";
import { formatError } from "../utils";

export async function getBillingPlans() {
  return await prisma.billingPlan.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  })
}

export async function createBillingPlan(data: Role) {

  try {
    const billingPlan = billingPlanSchema.parse(data)

    await prisma.billingPlan.create({
      data: {
        name: billingPlan.name,
        totalBillingCycles: billingPlan.totalBillingCycles,
        remark: billingPlan.remark,
        status: billingPlan.status
      }
    })

    return {
      success: true,
      message: "billing plan created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getBillingPlanById(id: string) {
  try {

    let billingPlan = await prisma.billingPlan.findFirst({
      where: { id }
    })

    if (billingPlan) {
      return {
        success: true,
        data: billingPlan,
        message: "Billing plan fetched successfully"
      }
    }

    return {
      success: false,
      message: "Billing plan not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateBillingPlan(data: Role, id: string) {
  try {

    const billingPlan = billingPlanSchema.parse(data)

    await prisma.billingPlan.update({
      where: { id },
      data: {
        name: billingPlan.name,
        totalBillingCycles: billingPlan.totalBillingCycles,
        remark: billingPlan.remark,
        status: billingPlan.status
      }
    })

    return {
      success: true,
      message: "Billing plan updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteBillingPlan(id: any) {
  try {
    await prisma.billingPlan.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Billing plan deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}