import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const now = new Date()
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  )

  const totalBilling = await prisma.bill.aggregate({
    _sum: { billingAmount: true },
  })

  const monthlyBilling = await prisma.bill.aggregate({
    _sum: { billingAmount: true },
    where: {
      billDate: {
        gte: firstDayOfMonth,
      },
    },
  })

  const billCount = await prisma.bill.count()

  const totalAmount = totalBilling._sum.billingAmount ?? 0
  const monthlyAmount = monthlyBilling._sum.billingAmount ?? 0

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        Billing Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader>
            <CardTitle>Total Billing Till Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹ {totalAmount.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹ {monthlyAmount.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Bill Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {billCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Billed Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₹ {totalAmount.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}