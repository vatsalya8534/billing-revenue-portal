import { prisma } from "@/lib/prisma"
import { BillTable } from "@/components/bill-table"


export default async function Page() {
  

  const tableData = [
    {
      id: 1,
      billtilldate:  0,
      billthismonth:  0,
      billdonecount: 0,
      billingAmount:  0,
    },
  ]

  return <BillTable data={tableData} />
}