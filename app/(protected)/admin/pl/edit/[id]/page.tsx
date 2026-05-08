import { notFound, redirect } from "next/navigation"
import { BillingPlan, Company } from "@/types"
import { getBillingCyclesByPOID, getprojectById } from "@/lib/actions/project"
import PLForm from "@/components/pl/pl-form"
import { getCompanys } from "@/lib/actions/company"
import { getBillingPlans } from "@/lib/actions/billing-plan"
import { canAccess } from "@/lib/rbac"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { BriefcaseBusiness } from "lucide-react"

const ProjectEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const companies = await getCompanys()
    const billingPlans = await getBillingPlans()

    const { id } = await params

    if (!id) return notFound()

    const project = await getprojectById(id)

    if (!project) return notFound()

    const billingCycles = await getBillingCyclesByPOID(id);

    const route = "/admin/pl";
    const canEdit = await canAccess(route, "edit")

    if (!canEdit) {
        redirect("/404");
    }

    const projectData = JSON.parse(JSON.stringify(project.data));
    const billingCycleData = JSON.parse(JSON.stringify(billingCycles.data ?? []));

    return (
        <EditPageShell
            title="Edit Project"
            backHref="/admin/pl"
            eyebrow="Project Record"
            icon={BriefcaseBusiness}
        >
            <PLForm
                billingCycles={billingCycleData}
                update={true}
                data={projectData}
                companies={companies as Company[]}
                billingPlans={billingPlans as BillingPlan[]}
            />
        </EditPageShell>
    )
}

export default ProjectEditPage
