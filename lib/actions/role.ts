"use server";

import { Role } from "@/types";
import { prisma } from "../prisma";
import { roleSchema } from "../validators";
import { formatError } from "../utils";

export async function getRoles() {
  return await prisma.role.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  })
}

export async function createRole(data: any) {

  try {
    const role = roleSchema.parse(data)

    await prisma.role.create({
      data: {
        name: role.name,
        remark: role.remark,
        status: role.status,
        roleModules: {
          create: data.modules.map((m: any) => ({
            moduleId: m.moduleId,
            canView: m.canView,
            canCreate: m.canCreate,
            canEdit: m.canEdit,
            canDelete: m.canDelete,
          })),
        },
      },
    });

    return {
      success: true,
      message: "role created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getRoleById(id: string) {
  try {

    let role = await prisma.role.findFirst({
      where: { id },
      include: {
        roleModules: true
      }
    })

    if (role) {
      return {
        success: true,
        data: role,
        message: "Role fetched successfully"
      }
    }

    return {
      success: false,
      message: "Role not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}


export async function updateRole(data: any, id: string) {
  try {

    const role = roleSchema.parse(data)
    await prisma.role.update({
      where: { id },
      data: {
        name: role.name,
        remark: role.remark,
        status: role.status,
        roleModules: {
          deleteMany: {}, // deletes all existing roleModules for this role
          create: data.modules.map((m: any) => ({
            moduleId: m.moduleId,
            canView: m.canView,
            canCreate: m.canCreate,
            canEdit: m.canEdit,
            canDelete: m.canDelete,
          })),
        },
      },
    });

    return {
      success: true,
      message: "Role updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteRole(id: any) {
  try {
    await prisma.role.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Role deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}