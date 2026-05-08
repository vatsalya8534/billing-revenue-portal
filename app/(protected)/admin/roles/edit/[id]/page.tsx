import RoleForm from "@/components/role/role-form"
import { getRoleById } from "@/lib/actions/role"
import { notFound, redirect } from "next/navigation"
import { getModules } from "@/lib/actions/module-action"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { ShieldCheck } from "lucide-react"

const RoleEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params

    if (!id) return notFound()

    const role = await getRoleById(id)

    if (!role) return notFound()

    const modules = await getModules();

    const route = "/admin/roles";

    const canEdit = await canAccess(route, "edit")

    if (!canEdit) {
        redirect("/404");
    }    

    return (
        <EditPageShell
            title="Edit Role"
            backHref="/admin/roles"
            eyebrow="Role Record"
            icon={ShieldCheck}
        >
                <RoleForm update={true} data={role.data} modules={modules} />
        </EditPageShell>
    )
}

export default RoleEditPage
