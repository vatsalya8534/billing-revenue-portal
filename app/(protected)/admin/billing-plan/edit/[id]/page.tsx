import BillingPlanForm from "@/components/billing-plan/billing-plan-form"
import { getBillingPlanById } from "@/lib/actions/billing-plan"
import { canAccess } from "@/lib/rbac"
import { notFound, redirect } from "next/navigation"
import { EditPageShell } from "@/components/ui/edit-page-shell"
import { ReceiptText } from "lucide-react"

const BillingPlanEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params

    if (!id) return notFound()

    const billingPlan = await getBillingPlanById(id)

    if (!billingPlan) return notFound()

    const route = "/admin/billing-plan";
    const canEdit = await canAccess(route, "edit")
    if (!canEdit) {
        redirect("/404");
    }


    return (
        <EditPageShell
            title="Edit Billing Plan"
            backHref="/admin/billing-plan"
            eyebrow="Billing Record"
            icon={ReceiptText}
        >
                <BillingPlanForm update={true} data={billingPlan.data} />
        </EditPageShell>
    )
}

export default BillingPlanEditPage
