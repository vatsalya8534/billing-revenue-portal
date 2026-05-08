import { notFound, redirect } from "next/navigation"
import CustomerForm from "../../../../../../components/customer/customer-form"
import { getCustomerById } from "@/lib/actions/customer"
import { Customer } from "@/types"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { UsersRound } from "lucide-react"

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
    <EditPageShell
      title="Edit Customer"
      backHref="/admin/customer"
      eyebrow="Customer Record"
      icon={UsersRound}
    >
        <CustomerForm data={customer.data as Customer} update={true} />
    </EditPageShell>

  )
}
