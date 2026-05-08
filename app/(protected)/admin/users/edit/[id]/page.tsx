"use server"

import { notFound, redirect } from "next/navigation"
import UserForm from "@/components/user/user-form"
import { getUserById } from "@/lib/actions/users"
import { User } from "@/types"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { UserRound } from "lucide-react"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params

  const user = await getUserById(id);  

  if (!user.success) notFound()

  const route = "/admin/users";
  
  const canEdit = await canAccess(route, "edit");
  if (!canEdit) {
    redirect("/404");
  }

  return (
    <EditPageShell
      title="Edit User"
      backHref="/admin/users"
      eyebrow="User Record"
      icon={UserRound}
    >
      <UserForm data={user.data as User} update={true} />
    </EditPageShell>
  )
}
