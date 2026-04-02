import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import BillingPlanForm from "@/components/billing-plan/billing-plan-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

const BillingPlanCreatePage = async () => {
  const route = "/admin/billing-plan";
  
  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Billing Plan</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/billing-plan">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <BillingPlanForm update={false} />
      </CardContent>
    </Card>
  );
};

export default BillingPlanCreatePage;
