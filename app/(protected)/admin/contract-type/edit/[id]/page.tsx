import { notFound, redirect } from "next/navigation"
import { getContractTypeById } from "@/lib/actions/contract-type"
import ContractTypeForm from "@/components/contract-type/contract-type-form"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { FileSignature } from "lucide-react"

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
        <EditPageShell
            title="Edit Contract Type"
            backHref="/admin/contract-type"
            eyebrow="Contract Record"
            icon={FileSignature}
        >
                <ContractTypeForm update={true} data={contractType.data} />
        </EditPageShell>
    )
}

export default ContractTypeEditPage
