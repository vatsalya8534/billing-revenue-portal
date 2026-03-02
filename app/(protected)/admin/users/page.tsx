import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./column"
import { getUsers } from "@/lib/actions/users"

export default async function UsersPage() {
  const res = await getUsers() 
  const users = res.map((u: any) => ({
    id: u.id,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    roleId: u.roleId,
    status: u.status,
    remark: u.remark,
    createdDate: u.createdDate,
    createdBy: u.createdBy,
  }))

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Users</CardTitle>
        <Link href="/admin/users/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create User</Button>
        </Link>
      </CardHeader>

      <CardContent>
        <DataTable columns={columns} data={users} />
      </CardContent>
    </Card>
  )
}