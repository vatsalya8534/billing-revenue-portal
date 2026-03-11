"use server";

import { Role } from "@/types";
import { prisma } from "../prisma";
import { serviceTypeSchema } from "../validators";
import { formatError } from "../utils";

export async function getServiceTypes() {
  return await prisma.serviceType.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  })
}

export async function createServiceType(data: Role) {

  try {
    const serviceType = serviceTypeSchema.parse(data)

    await prisma.serviceType.create({
      data: {
        name: serviceType.name,
        remark: serviceType.remark,
        status: serviceType.status
      }
    })

    return {
      success: true,
      message: "service type created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getServiceTypeById(id: string) {
  try {

    let serviceType = await prisma.serviceType.findFirst({
      where: { id }
    })

    if (serviceType) {
      return {
        success: true,
        data: serviceType,
        message: "Service type fetched successfully"
      }
    }

    return {
      success: false,
      message: "Service type not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateServiceType(data: Role, id: string) {
  try {

    const serviceType = serviceTypeSchema.parse(data)

    await prisma.serviceType.update({
      where: { id },
      data: {
        name: serviceType.name,
        remark: serviceType.remark,
        status: serviceType.status
      }
    })

    return {
      success: true,
      message: "Service type updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteServiceType(id: any) {
  try {
    await prisma.serviceType.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Service type deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}