import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRoles } from "@/lib/actions/role"
import { Role } from "@prisma/client"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./column"

const RolesPage = async () => {
  const roles: Role[] = await getRoles()

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Roles</CardTitle>
        <Link href="/admin/roles/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Role</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={roles} />
      </CardContent>
    </Card>
  )
}

export default RolesPage