import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import CustomerForm from "../../../../../../components/customer/customer-form"
import { getCustomerById } from "@/lib/actions/customer"
import { Customer } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { canAccess } from "@/lib/rbac"

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  if (!id) {
    notFound()
  }

  const customer = await getCustomerById(id)

  if (!customer) {
    notFound()
  }


  const route = "/admin/customer";
  const canEdit = await canAccess(route, "edit")
  if (!canEdit) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Edit Customer</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/customer">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <CustomerForm data={customer.data as Customer} update={true} />
      </CardContent>
    </Card>

  )
}