import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import CustomerForm from "../../../../../../components/customer/customer-form"
import { getCustomerById } from "@/lib/actions/customer"
import { Company, Customer } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getcompanyById } from "@/lib/actions/company"
import CompanyForm from "@/components/company/company-form"

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  if (!id) {
    notFound()
  }

  const company = await getcompanyById(id)

  if (!company) {
    notFound()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Edit Company</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/company">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <CompanyForm data={company.data as Company} update={true} />
      </CardContent>
    </Card>

  )
}