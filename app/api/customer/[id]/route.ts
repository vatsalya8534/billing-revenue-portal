import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Customer ID missing" },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (error) {
    console.error("Delete error:", error)

    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 }
    )
  }
}