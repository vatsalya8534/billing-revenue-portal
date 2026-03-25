import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BillingPlan } from "@/types"
import { BillingPlanDataTable } from "./billing-plan-datatable"
import { getBillingPlans } from "@/lib/actions/billing-plan"

const RolesPage = async () => {
  const billingPlans = await getBillingPlans()

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Billing Plans</CardTitle>
        <Link href="/admin/billing-plan/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Billing Plan</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <BillingPlanDataTable data={billingPlans.data as BillingPlan[]} />
      </CardContent>
    </Card>
  )
}

export default RolesPage