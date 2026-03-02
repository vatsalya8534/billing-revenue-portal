"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createRole(data: {
  roleName: string
  createdBy: string
  remark?: string
}) {
  const role = await prisma.role.create({
    data: {
      roleName: data.roleName,
      createdBy: data.createdBy,
      remark: data.remark,
    },
  })

  revalidatePath("/roles")
  return role
}

export async function getRoles() {
  return prisma.role.findMany({
    orderBy: { createdDate: "desc" },
    include: {
      users: true, 
    },
  })
}

export async function getRoleById(id: number) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      users: true,
    },
  })
}

export async function updateRole(
  id: number,
  data: {
    roleName?: string
    remark?: string
  }
) {
  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      roleName: data.roleName,
      remark: data.remark,
    },
  })

  revalidatePath("/roles")
  return updatedRole
}

export async function deleteRole(id: number) {
  await prisma.role.delete({
    where: { id },
  })

  revalidatePath("/roles")
}