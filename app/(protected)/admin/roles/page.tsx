import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { getRoles } from "@/lib/actions/role"
import { canAccess, getUserPermissions } from "@/lib/rbac"
import { redirect } from "next/navigation"
import RoleDataTable from "./role-datatable"

const RolesPage = async () => {
  const roles: Role[] = await getRoles()

  const user = await getUserPermissions();
  const route = "/admin/roles";

  const canView = await canAccess(route, "view")

  if (!canView) {
    redirect("/404");
  }

  const roleName = user?.role?.name || "";
  const isAdmin = roleName.toLowerCase().includes("admin");

  const canCreate = isAdmin || canAccess(route, "create");
  const canEdit = isAdmin || canAccess(route, "edit");
  const canDelete = isAdmin || canAccess(route, "delete");

  console.log(canCreate, canEdit, canDelete);


  return (
    <RoleDataTable data={roles}
      canEdit={canEdit}
      canDelete={canDelete}
      title="Role"
      actions={
        canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/roles/create">Add Role</Link>
          </Button>
        )
      } />
  )
}

export default RolesPage