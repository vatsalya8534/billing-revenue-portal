import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServiceTypes } from "@/lib/actions/service-type"
import { ServiceType } from "@/types"
import { canAccess, getUserPermissions } from "@/lib/rbac"
import { redirect } from "next/navigation"
import ServiceTypeDataTable from "./service-type-datatable"

const RolesPage = async () => {
  const serviceTypes: ServiceType[] = await getServiceTypes()

  const route = "/admin/service-type";

  let canView = await canAccess(route, "view");

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
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/service-type/create">Add Service Type</Link>
          </Button>
        )
      } />
  )
}

export default RolesPage