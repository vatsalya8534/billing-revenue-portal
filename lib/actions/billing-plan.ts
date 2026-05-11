"use server";

import { prisma } from "../prisma";
import { billingPlanSchema } from "../validators";
import { formatError } from "../utils";
import { z } from "zod";

type BillingPlanInput = z.infer<typeof billingPlanSchema>;

function normalizeBillingPlanPayload(billingPlan: BillingPlanInput) {
  const name = billingPlan.name?.trim();

  if (!name) {
    throw new Error("Billing plan name is required");
  }

  return {
    name,
    totalBillingCycles: Number(billingPlan.totalBillingCycles ?? 0),
    remark: billingPlan.remark ?? null,
    status: billingPlan.status ?? "ACTIVE",
    billingCycleType: billingPlan.billingCycleType ?? "START",
  } as const;
}

// ---------------- GET ALL ----------------
export async function getBillingPlans() {
  try {
    const data = await prisma.billingPlan.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return data;
    
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
    const payload = normalizeBillingPlanPayload(billingPlan);

    await prisma.billingPlan.create({
      data: payload,
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
    const payload = normalizeBillingPlanPayload(billingPlan);

    await prisma.billingPlan.update({
      where: { id },
      data: payload,
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
