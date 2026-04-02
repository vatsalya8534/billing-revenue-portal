import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getServiceTypeById } from "@/lib/actions/service-type"
import ServiceTypeForm from "@/components/service-type/service-type-form"
import { canAccess } from "@/lib/rbac"

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
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Service Type</CardTitle>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Link href="/admin/service-type">Back</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <ServiceTypeForm update={true} data={serviceType.data} />
            </CardContent>
        </Card>
    )
}

export default ServiceTypeEditPage