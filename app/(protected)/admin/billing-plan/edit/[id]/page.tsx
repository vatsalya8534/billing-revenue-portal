import BillingPlanForm from "@/components/billing-plan/billing-plan-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBillingPlanById } from "@/lib/actions/billing-plan"
import Link from "next/link"
import { notFound } from "next/navigation"

const BillingPlanEditPage = async ({
    params,
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params

    if (!id) return notFound()

    const billingPlan = await getBillingPlanById(id)

    if (!billingPlan) return notFound()

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Edit Billing Plan</CardTitle>
                    <Link href="/admin/billing-plan">
                        <Button className="bg-blue-500 hover:bg-blue-600">
                            Back
                        </Button>
                    </Link>
                </div>
            </CardHeader>

            <CardContent>
                <BillingPlanForm update={true} data={billingPlan.data} />
            </CardContent>
        </Card>
    )
}

export default BillingPlanEditPage