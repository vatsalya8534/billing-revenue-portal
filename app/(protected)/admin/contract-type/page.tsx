import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getContractTypes } from "@/lib/actions/contract-type"
import { ContractType } from "@/types"
import { canAccess, getUserPermissions } from "@/lib/rbac"
import { redirect } from "next/navigation"
import ContractTypeDataTable from "./contract-type-datatable"

const RolesPage = async () => {
  const contactTypes: ContractType[] = await getContractTypes()

  const route = "/admin/contract-type";
  const canView = await canAccess(route, "view")
  if (!canView) {
    redirect("/404");
  }

  const canCreate = await canAccess(route, "create");
  const canEdit = await canAccess(route, "edit");
  const canDelete = await canAccess(route, "delete");

  return (
    <ContractTypeDataTable data={contactTypes}
      canEdit={canEdit}
      canDelete={canDelete}
      title="Contract Type"
      actions={
        canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/contract-type/create">Add Contract Type</Link>
          </Button>
        )
      } />
  );
}

export default RolesPage