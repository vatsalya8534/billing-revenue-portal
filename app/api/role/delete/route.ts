import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get("id"))

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  await prisma.role.delete({
    where: { id },
  })

  return NextResponse.json({ message: "Deleted" })
}