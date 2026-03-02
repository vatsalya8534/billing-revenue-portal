import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total Bills
    const totalBills = await prisma.bill.count()

    // Total Amount Till Date
    const totalAmount = await prisma.bill.aggregate({
      _sum: {
        billingAmount: true,
      },
    })

    // This Month Bills
    const thisMonthAmount = await prisma.bill.aggregate({
      where: {
        billDate: {
          gte: firstDay,
        },
      },
      _sum: {
        billingAmount: true,
      },
    })

    // // Status Count
    // const statusCount = await prisma.bill.groupBy({
    //   by: ["status"],
    //   _count: {
    //     status: true,
    //   },
    // })

    return NextResponse.json({
      totalBills,
      totalAmount: totalAmount._sum.billingAmount || 0,
      thisMonthAmount: thisMonthAmount._sum.billingAmount || 0,
      // statusCount,
    })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}