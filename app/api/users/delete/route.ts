import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get("id"))

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.user.delete({
    where: { id },
  })

  return NextResponse.json({ message: "User deleted successfully" })
}