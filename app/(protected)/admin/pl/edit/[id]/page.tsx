import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RoleForm from "@/components/role/role-form"
import Link from "next/link"
import { getRoleById } from "@/lib/actions/role"
import { notFound } from "next/navigation"
import { Project, Role } from "@/types"
import { getBillingCyclesByPOID, getprojectById } from "@/lib/actions/project"
import PLForm from "@/components/pl/pl-form"
import { getCompanys } from "@/lib/actions/company"
import { getBillingPlans } from "@/lib/actions/billing-plan"
import { Company } from "@prisma/client"

const ProjectEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    let companies = await getCompanys()
    let billingPlans = await getBillingPlans()

    const { id } = await params

    if (!id) return notFound()

    let project = await getprojectById(id)

    if (!project) return notFound()

    const billingCycles = await getBillingCyclesByPOID(id);

    project = JSON.parse(JSON.stringify(project))

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Project</CardTitle>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Link href="/admin/pl">Back</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <PLForm  billingCycles={JSON.parse(JSON.stringify(billingCycles.data))} update={true} data={JSON.parse(JSON.stringify(project.data)) as any} companies={companies as any} billingPlans={billingPlans} />
            </CardContent>
        </Card>
    )
}

export default ProjectEditPage