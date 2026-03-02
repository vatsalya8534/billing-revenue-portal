// "use server"

// import { prisma } from "@/lib/prisma"
// import { revalidatePath } from "next/cache"
// import { Status } from "@prisma/client"
// import bcrypt from "bcryptjs"

// // Create User
// export async function createUser(data: {
//   username: string
//   password: string
//   firstName: string
//   lastName: string
//   roleId: number   // <-- use roleId instead of roleName
//   createdBy: string
//   remark?: string
//   status?: Status
// }) {
//   const user = await prisma.user.create({
//     data: {
//       username: data.username,
//       password: data.password,
//       firstName: data.firstName,
//       lastName: data.lastName,
//       roleId: data.roleId, 
//       createdBy: data.createdBy,
//       remark: data.remark,
//       status: data.status ?? Status.ACTIVE,
//     },
//   })

//   revalidatePath("/users")
//   return user
// }

// // GET USERS
// export async function getUsers() {
//   return prisma.user.findMany({
//     orderBy: { createdDate: "desc" },
//   })
// }


// // UPDATE USER
// export async function updateUser(
//   id: number,
//   data: {
//     username?: string;
//     password?: string;
//     firstName?: string;
//     lastName?: string;
//     roleId?: number;
//     status?: Status;
//     remark?: string;
//   }
// ) {
//   // Hash password if provided
//   if (data.password) {
//     data.password = await bcrypt.hash(data.password, 10);
//   }

//   const updated = await prisma.user.update({
//     where: { id },
//     data,
//   });

//   // Revalidate users page
//   revalidatePath("/admin/users");

//   return updated;
// }


// // DELETE USER

// export async function deleteUser(id: number) {
//   await prisma.user.delete({
//     where: { id },
//   })

//   revalidatePath("/users")
// }

// users/actions.ts
"use server"; // ⚠️ Important for server actions

import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// CREATE USER
export async function createUser(data: {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
  createdBy: string;
  status?: Status;
  remark?: string;
}) {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: await bcrypt.hash(data.password, 10),
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
      createdBy: data.createdBy,
      status: data.status ?? Status.ACTIVE,
      remark: data.remark,
    },
  });

  revalidatePath("/admin/users");
  return user;
}

// // GET USERS
export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdDate: "desc" },
  })
}

// UPDATE USER (Server Action)
export async function updateUser(
  id: number,
  data: {
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    roleId?: number;
    status?: Status;
    remark?: string;
  }
) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/users");
  return updated;
}

// // DELETE USER

export async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id },
  })

  revalidatePath("/users")
}