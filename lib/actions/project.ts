"use server";

import { Project } from "@/types";
import { prisma } from "../prisma";
import { projectSchema } from "../validators";
import { formatError } from "../utils";

export async function getProjects() {

  return await prisma.project.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      company: true,
      billingPlan: true
    }
  })
}

export async function createProject(data: Project) {

  try {
    const project = projectSchema.parse(data)

    let amount = getTotalAmount(data.billingCycle);

    let result = await prisma.project.create({
      data: {
        companyId: project.companyId,
        projectName: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
        poValue: project.poValue || "",
        resourceCount: project.resourceCount,
        billingPlanId: project.billingPlanId,
        orderType: project.orderType,
        totalRevenue: amount.totalRevenue,
        totalCost: amount.totalCost,
        status: project.status,
      }
    })

    createBillingCycle(data.billingCycle, result.id)

    return {
      success: true,
      message: "Project created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getprojectById(id: string) {
  try {

    let project = await prisma.project.findFirst({
      where: { id }
    })

    if (project) {
      return {
        success: true,
        data: project,
        message: "Project fetched successfully"
      }
    }

    return {
      success: false,
      message: "Project not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateProject(data: Project, id: string) {
  try {

    const project = projectSchema.parse(data)

    let amount = getTotalAmount(data.billingCycle);

    await prisma.project.update({
      where: { id },
      data: {
        companyId: project.companyId,
        projectName: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
        poValue: project.poValue,
        resourceCount: project.resourceCount,
        billingPlanId: project.billingPlanId,
        orderType: project.orderType,
        totalRevenue: amount.totalRevenue,
        totalCost: amount.totalCost,
        status: project.status,
      }
    })

    createBillingCycle(data.billingCycle, id)

    return {
      success: true,
      message: "Project updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteProject(id: any) {
  try {
    await prisma.project.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Project deleted successfully"
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

    let billingCycles = await prisma.projectMonthlyPL.findMany({
      where: {
        projectId: id
      }
    })

    if (billingCycles) {
      return {
        success: true,
        data: billingCycles,
        message: "ProjectMonthlyPL fetched successfully"
      }
    }

    return {
      success: false,
      message: "ProjectMonthlyPL not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}


async function createBillingCycle(data: any, id: string) {

  try {
    await prisma.projectMonthlyPL.deleteMany({
      where: {
        projectId: id
      }
    })

    for (const projectMonthlyPL of data) {
      await prisma.projectMonthlyPL.create({
        data: {
          projectId: id,
          month: projectMonthlyPL.month,
          year: projectMonthlyPL.year,
          billedAmount: projectMonthlyPL.billedAmount,
          otherCost: JSON.stringify(projectMonthlyPL.otherCost),
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

function getTotalAmount(data: any) {

  let amount = {
    totalRevenue: 0,
    totalCost: 0
  }

  if (data) {
    for (const billingCycle of data) {
      amount.totalRevenue += billingCycle.billedAmount;

      let otherCostData: any[] = [];

      if (typeof billingCycle.otherCost === "string") {
        try {
          otherCostData = JSON.parse(billingCycle.otherCost);
        } catch (e) {
          console.error("Invalid JSON:", billingCycle.otherCost);
        }
      } else {
        otherCostData = billingCycle.otherCost;
      }

      for (const otherCost of otherCostData) {
        if (isFinite(otherCost.value)) amount.totalCost += Number(otherCost.value)
      }
    }
  }

  return amount
}
