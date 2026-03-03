"use server"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import UserForm from "@/components/user/user-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getUserById } from "@/lib/actions/users"
import { User } from "@/types"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params


  const user = await getUserById(id);

  if (!user.success) notFound()


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
          <UserForm data={user.data as User} update={true} />
        </CardContent>
      </Card>
    </div>
  )
}