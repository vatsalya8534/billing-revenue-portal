"use server";

import { prisma } from "../prisma";
import { billingPlanSchema } from "../validators";
import { formatError } from "../utils";
import { z } from "zod";

// ✅ Correct type from Zod schema
type BillingPlanInput = z.infer<typeof billingPlanSchema>;

// ---------------- GET ALL ----------------
export async function getBillingPlans() {
  try {
    const data = await prisma.billingPlan.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// ---------------- CREATE ----------------
export async function createBillingPlan(data: BillingPlanInput) {
  try {
    const billingPlan = billingPlanSchema.parse(data);

    await prisma.billingPlan.create({
      data: {
        name: billingPlan.name,
        totalBillingCycles: billingPlan.totalBillingCycles,
        remark: billingPlan.remark,
        status: billingPlan.status,
        billingCycleType: billingPlan.billingCycleType,
      },
    });

    return {
      success: true,
      message: "Billing plan created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// ---------------- GET BY ID ----------------
export async function getBillingPlanById(id: string) {
  try {
    const billingPlan = await prisma.billingPlan.findUnique({
      where: { id },
    });

    if (!billingPlan) {
      return {
        success: false,
        message: "Billing plan not found",
      };
    }

    return {
      success: true,
      data: billingPlan,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// ---------------- UPDATE ----------------
export async function updateBillingPlan(
  data: BillingPlanInput,
  id: string
) {
  try {
    const billingPlan = billingPlanSchema.parse(data);

    await prisma.billingPlan.update({
      where: { id },
      data: {
        name: billingPlan.name,
        totalBillingCycles: billingPlan.totalBillingCycles,
        remark: billingPlan.remark,
        status: billingPlan.status,
        billingCycleType: billingPlan.billingCycleType,
      },
    });

    return {
      success: true,
      message: "Billing plan updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// ---------------- DELETE ----------------
export async function deleteBillingPlan(id: string) {
  try {
    await prisma.billingPlan.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Billing plan deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}