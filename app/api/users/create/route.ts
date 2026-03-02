
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { userSchema } from "@/lib/validators"
import { z } from "zod"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = userSchema.parse(body)

    const {
      username,
      password,
      firstName,
      lastName,
      status,
      roleId,
      remark,
    } = validatedData

    // 🔹 Check password
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    // 🔹 Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    // 🔹 Check role
    const role = await prisma.role.findUnique({
      where: { id: Number(roleId) },
    })

    if (!role) {
      return NextResponse.json(
        { error: "Invalid role ID" },
        { status: 400 }
      )
    }

    // 🔹 Hash password (WITH await)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🔹 Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        status,
        roleId: Number(roleId),
        remark,
        createdDate: new Date(),
        createdBy: "admin",
      },
    })

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error(error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}