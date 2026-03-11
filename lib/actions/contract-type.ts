"use server";

import { Role } from "@/types";
import { prisma } from "../prisma";
import { contractTypeSchema } from "../validators";
import { formatError } from "../utils";

export async function getContractTypes() {
  return await prisma.contractType.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  })
}

export async function createContractType(data: Role) {

  try {
    const contractType = contractTypeSchema.parse(data)

    await prisma.contractType.create({
      data: {
        name: contractType.name,
        remark: contractType.remark,
        status: contractType.status
      }
    })

    return {
      success: true,
      message: "contract type created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getContractTypeById(id: string) {
  try {

    let contractType = await prisma.contractType.findFirst({
      where: { id }
    })

    if (contractType) {
      return {
        success: true,
        data: contractType,
        message: "Contract type fetched successfully"
      }
    }

    return {
      success: false,
      message: "Contract type not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateContractType(data: Role, id: string) {
  try {

    const contractType = contractTypeSchema.parse(data)

    await prisma.contractType.update({
      where: { id },
      data: {
        name: contractType.name,
        remark: contractType.remark,
        status: contractType.status
      }
    })

    return {
      success: true,
      message: "Contract type updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteContractType(id: any) {
  try {
    await prisma.contractType.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Contract type deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}