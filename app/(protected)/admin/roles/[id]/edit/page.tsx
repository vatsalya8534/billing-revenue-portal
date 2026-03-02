import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleForm from "@/components/role/role-form"
import Link from "next/link"
import { getRoleById } from "@/lib/actions/role"
import { notFound } from "next/navigation"

const RoleEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {

  const { id } = await params  
  const numericId = Number(id)

  if (isNaN(numericId)) return notFound()

  const role = await getRoleById(numericId)

  if (!role) return notFound()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Edit Role</CardTitle>
          <Link href="/admin/roles">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Back
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <RoleForm update={true} data={role} />
      </CardContent>
    </Card>
  )
}

export default RoleEditPage