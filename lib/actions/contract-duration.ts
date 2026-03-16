"use server";

import { ContractDuration } from "@/types";
import { prisma } from "../prisma";
import { billingPlanSchema, contractDurationSchema } from "../validators";
import { formatError } from "../utils";

export async function getContractDurations() {
  return await prisma.contractDuration.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  })
}

export async function createContractDuration(data: ContractDuration) {

  try {
    const contractDuration = contractDurationSchema.parse(data)

    await prisma.contractDuration.create({
      data: {
        name: contractDuration.name,
        totalNumberOfMonths: contractDuration.totalNumberOfMonths,
        remark: contractDuration.remark,
        status: contractDuration.status
      }
    })

    return {
      success: true,
      message: "Contract Duration created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getContractDurationById(id: string) {
  try {

    let contractDuration = await prisma.contractDuration.findFirst({
      where: { id }
    })

    if (contractDuration) {
      return {
        success: true,
        data: contractDuration,
        message: "Contract Duration fetched successfully"
      }
    }

    return {
      success: false,
      message: "Contract Duration not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateContractDuration(data: ContractDuration, id: string) {
  try {

  const contractDuration = contractDurationSchema.parse(data)

    await prisma.contractDuration.update({
      where: { id },
      data: {
        name: contractDuration.name,
        totalNumberOfMonths: contractDuration.totalNumberOfMonths,
        remark: contractDuration.remark,
        status: contractDuration.status
      }
    })

    return {
      success: true,
      message: "Contract Duration updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteContractDuration(id: any) {
  try {
    await prisma.contractDuration.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Contract Duration deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}