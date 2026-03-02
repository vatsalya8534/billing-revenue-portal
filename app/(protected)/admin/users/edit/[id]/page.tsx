"use server"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import UserForm from "@/components/user/user-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  if (!id) return notFound()

  const numericId = Number(id)
  if (isNaN(numericId)) return notFound()

  const user = await prisma.user.findUnique({ where: { id: numericId } })
  if (!user) return notFound()

  const userFormData = {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
    status: user.status,
    remark: user.remark ?? "",
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit User</CardTitle>
            <Link href="/admin/users">
              <Button className="bg-blue-500 hover:bg-blue-600">Back</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <UserForm data={userFormData} roles={[]} update />
        </CardContent>
      </Card>
    </div>
  )
}