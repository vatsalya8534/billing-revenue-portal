"use server";

import { Role } from "@/types";
import { prisma } from "../prisma";
import { contractTypeSchema } from "../validators";
import { formatError } from "../utils";

function normalizeContractTypePayload(contractType: {
  name?: string;
  remark?: string | null;
  status?: "ACTIVE" | "INACTIVE";
}) {
  const name = contractType.name?.trim();

  if (!name) {
    throw new Error("Contract type name is required");
  }

  return {
    name,
    remark: contractType.remark ?? null,
    status: contractType.status ?? "ACTIVE",
  } as const;
}

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
    const payload = normalizeContractTypePayload(contractType)

    await prisma.contractType.create({
      data: payload
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
    const payload = normalizeContractTypePayload(contractType)

    await prisma.contractType.update({
      where: { id },
      data: payload
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
