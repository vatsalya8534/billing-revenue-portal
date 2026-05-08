import { notFound, redirect } from "next/navigation"
import { getServiceTypeById } from "@/lib/actions/service-type"
import ServiceTypeForm from "@/components/service-type/service-type-form"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { Wrench } from "lucide-react"

const ServiceTypeEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params

    if (!id) return notFound()

    const serviceType = await getServiceTypeById(id)

    if (!serviceType) return notFound()

    const route = "/admin/service-type";
    
    const canEdit = await canAccess(route, "edit");
    if (!canEdit) {
        redirect("/404");
    }

    return (
        <EditPageShell
            title="Edit Service Type"
            backHref="/admin/service-type"
            eyebrow="Service Record"
            icon={Wrench}
        >
                <ServiceTypeForm update={true} data={serviceType.data} />
        </EditPageShell>
    )
}

export default ServiceTypeEditPage
