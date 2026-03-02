import { prisma } from "@/lib/prisma"
import { BillTable } from "@/components/bill-table"


export default async function Page() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalBills = await prisma.bill.count()

  const totalAmount = await prisma.bill.aggregate({
    _sum: { billingAmount: true },
  })

  const thisMonthAmount = await prisma.bill.aggregate({
    where: {
      billDate: { gte: startOfMonth },
    },
    _sum: { billingAmount: true },
  })

  const tableData = [
    {
      id: 1,
      billtilldate: totalAmount._sum.billingAmount ?? 0,
      billthismonth: thisMonthAmount._sum.billingAmount ?? 0,
      billdonecount: totalBills,
      billingAmount: totalAmount._sum.billingAmount ?? 0,
    },
  ]

  return <BillTable data={tableData} />
}