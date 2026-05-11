"use server";

import { User } from "@/types";
import { prisma } from "../prisma";
import { createUserSchema, loginFormSchema, userSchema } from "../validators";
import { formatError } from "../utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth, signIn, signOut } from "@/auth";
import bcrypt from "bcrypt";

function normalizeUserPayload(user: User) {
  const username = user.username?.trim();
  const firstName = user.firstName?.trim();
  const email = user.email?.trim();
  const roleId = user.roleId?.trim();

  if (!username) {
    throw new Error("Username is required");
  }

  if (!firstName) {
    throw new Error("First name is required");
  }

  if (!email) {
    throw new Error("Email is required");
  }

  if (!roleId) {
    throw new Error("Role is required");
  }

  return {
    username,
    firstName,
    lastName: user.lastName?.trim() || "",
    email,
    status: user.status ?? "ACTIVE",
    roleId,
    remark: user.remark?.trim() || null,
  } as const;
}

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
    const password = user.password?.trim();

    if (!password) {
      throw new Error("Password is required");
    }
    const payload = normalizeUserPayload(user);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
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
    const payload = normalizeUserPayload(user)

    await prisma.user.update({
      where: { id },
      data: payload
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
  const result = loginFormSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  // Validation failed
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  const user = result.data;

  try {
    await signIn("credentials", user);

    return {
      success: true,
      message: "Login successfully",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: "Invalid username or password",
    };
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


export async function getCurrentUser() {
  try {
    const session = await auth();

    if (session?.user) {
      let userSession = session.user;

      return await getUserById(userSession.id as string)
    }
    return null;
  } catch (err) {
    console.error("Failed to get current user:", err);
    return null; 
  }
}
