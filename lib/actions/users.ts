"use server";

import { User } from "@/types";
import { prisma } from "../prisma";
import { createUserSchema, loginFormSchema, userSchema } from "../validators";
import { formatError } from "../utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcrypt";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: { role: true }
  })
}

export async function createUser(data: User) {

  try {
    const user = createUserSchema.parse(data)

    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.create({
      data: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        status: user.status,
        roleId: user.roleId,
        remark: user.remark,
      }
    })

    return {
      success: true,
      message: "User created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getUserById(id: string) {
  try {

    let user = await prisma.user.findFirst({
      where: { id }
    })

    if (user) {
      return {
        success: true,
        data: user,
        message: "User fetched successfully"
      }
    }

    return {
      success: false,
      message: "User not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}


export async function updateUser(data: User, id: string) {
  try {

    const user = userSchema.parse(data)

    await prisma.user.update({
      where: { id },
      data: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status,
        roleId: user.roleId,
        remark: user.remark,
      }
    })

    return {
      success: true,
      message: "User updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteUser(id: any) {
  try {
    await prisma.user.delete({
      where: { id }
    })

    return {
      success: true,
      message: "User deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function loginFormUser(prevState: unknown, formData: FormData) {

  const user = loginFormSchema.parse({
    username: formData.get("username"),
    password: formData.get("password")
  })

  try {
    await signIn("credentials", user)

    return {
      success: true,
      message: "Login successfully"
    }

  } catch (error) {

    if (isRedirectError(error)) {
      throw error
    }

    return {
      success: false,
      message: "Invalid username and password"
    }
  }
}

// logout user
export async function logoutUser() {
  try {
    await signOut()
    return {
      success: true,
      message: "logout successfully"
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }

    return {
      success: false,
      message: "Something went wrong"
    }
  }
}