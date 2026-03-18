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

    await prisma.project.create({
      data: {
        companyId: project.companyId,
        projectName: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
        poValue: project.poValue || "",
        resourceCount: project.resourceCount,
        billingPlanId: project.billingPlanId,
        orderType: project.orderType,
        status: project.status,
      }
    })

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
        status: project.status,
      }
    })

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