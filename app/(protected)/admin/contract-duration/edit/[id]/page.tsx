import ContractDurationForm from "@/components/contract-duration/contract-duration-form"
import { getContractDurationById } from "@/lib/actions/contract-duration"
import { canAccess } from "@/lib/rbac"
import { notFound, redirect } from "next/navigation"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { CalendarRange } from "lucide-react"

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
        <EditPageShell
            title="Edit Contract Duration"
            backHref="/admin/contract-duration"
            eyebrow="Duration Record"
            icon={CalendarRange}
        >
                <ContractDurationForm update={true} data={contractDuration.data} />
        </EditPageShell>
    )
}

export default ContractDurationEditPage
