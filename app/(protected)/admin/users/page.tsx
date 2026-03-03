import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./column"
import { getUsers } from "@/lib/actions/users"
import { UserDataTable } from "./user-datatable"
import { User } from "@/types"

export default async function UsersPage() {
  const users = await getUsers() 

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Users</CardTitle>
        <Link href="/admin/users/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create User</Button>
        </Link>
      </CardHeader>

      <CardContent>
        <UserDataTable data={users as User[]} />
      </CardContent>
    </Card>
  )
}