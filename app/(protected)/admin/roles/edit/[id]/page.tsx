import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleForm from "@/components/role/role-form"
import Link from "next/link"
import { getRoleById } from "@/lib/actions/role"
import { notFound } from "next/navigation"
import { Role } from "@/types"
import { getModules } from "@/lib/actions/module-action"

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

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Role</CardTitle>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Link href="/admin/roles">Back</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <RoleForm update={true} data={role.data} modules={modules} />
            </CardContent>
        </Card>
    )
}

export default RoleEditPage