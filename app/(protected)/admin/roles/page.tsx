import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Role } from "@prisma/client"
import { getRoles } from "@/lib/actions/role"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleDataTable } from "./role-datatable"

const RolesPage = async () => {
  const roles: Role[] = await getRoles()
  console.log(roles);


  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Roles</CardTitle>
        <Link href="/admin/roles/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Role</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <RoleDataTable data={roles as Role[]} />
      </CardContent>
    </Card>
  )
}

export default RolesPage