import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleForm from "@/components/role/role-form"
import Link from "next/link"
import { getRoleById } from "@/lib/actions/role"
import { notFound, redirect } from "next/navigation"
import { Role } from "@/types"
import { getContractTypeById } from "@/lib/actions/contract-type"
import ContractTypeForm from "@/components/contract-type/contract-type-form"
import { canAccess } from "@/lib/rbac"

const ContractTypeEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params

    if (!id) return notFound()

    const contractType = await getContractTypeById(id)

    if (!contractType) return notFound()

    const route = "/admin/contract-type";
    const canEdit = await canAccess(route, "edit")
    if (!canEdit) {
        redirect("/404");
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Contract Type</CardTitle>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Link href="/admin/contract-type">Back</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ContractTypeForm update={true} data={contractType.data} />
            </CardContent>
        </Card>
    )
}

export default ContractTypeEditPage