import { notFound, redirect } from "next/navigation"
import { Company } from "@/types"
import { getcompanyById } from "@/lib/actions/company"
import CompanyForm from "@/components/company/company-form"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { Building2 } from "lucide-react"

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

  const route = "/admin/company";

  const canEdit = await canAccess(route, "edit")
  if (!canEdit) {
    redirect("/404");
  }

  return (
    <EditPageShell
      title="Edit Company"
      backHref="/admin/company"
      eyebrow="Company Record"
      icon={Building2}
    >
        <CompanyForm data={company.data as Company} update={true} />
    </EditPageShell>

  )
}
