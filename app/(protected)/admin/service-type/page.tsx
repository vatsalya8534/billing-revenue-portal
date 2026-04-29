import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServiceTypes } from "@/lib/actions/service-type"
import { canAccess } from "@/lib/rbac"
import { redirect } from "next/navigation"
import ServiceTypeDataTable from "./service-type-datatable"

const ServiceTypePage = async () => {
  const serviceTypes = await getServiceTypes()

  const route = "/admin/service-type";

  const canView = await canAccess(route, "view");

  if (!canView) {
    redirect("/404");
  }

  const canCreate = await canAccess(route, "create");
  const canEdit = await canAccess(route, "edit");
  const canDelete = await canAccess(route, "delete");

  return (
    <ServiceTypeDataTable data={serviceTypes}
      canEdit={canEdit}
      canDelete={canDelete}
      title="Service Type"
      actions={
        canCreate && (
          <Button className="rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700">
            <Link href="/admin/service-type/create">Add Service Type</Link>
          </Button>
        )
      } />
  )
}

export default ServiceTypePage
