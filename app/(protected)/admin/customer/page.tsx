import { prisma } from "@/lib/prisma"
import CustomerDatatable from "./customer-datatable"

export default async function CustomerPage() {

  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="p-6">
      <CustomerDatatable data={customers} />
    </div>
  )
}