import ContractDurationForm from "@/components/contract-duration/contract-duration-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getContractDurationById } from "@/lib/actions/contract-duration"
import { canAccess } from "@/lib/rbac"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

const ContractDurationEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params

    if (!id) return notFound()

    const contractDuration = await getContractDurationById(id)

    if (!contractDuration) return notFound()

    const route = "/admin/contract-duration";

    const canEdit = await canAccess(route, "edit")
    if (!canEdit) {
        redirect("/404");
    }


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Contract Duration</CardTitle>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Link href="/admin/contract-duration">Back</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ContractDurationForm update={true} data={contractDuration.data} />
            </CardContent>
        </Card>
    )
}

export default ContractDurationEditPage