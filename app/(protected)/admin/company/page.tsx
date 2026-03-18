import { prisma } from "@/lib/prisma"
import { CompanyDatatable } from "./company-datatable"
import { getCompanys } from "@/lib/actions/company"
import { Company } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CustomerPage() {
  const company = await getCompanys()

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Company</CardTitle>
        <Button className="bg-blue-500 hover:bg-blue-600" asChild>
          <Link href="/admin/company/create">
            Create Company
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <CompanyDatatable data={company as Company[]} />
      </CardContent>
    </Card>

  )
}