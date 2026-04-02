import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import BillingPlanForm from "@/components/billing-plan/billing-plan-form";
import ContractTypeForm from "@/components/contract-type/contract-type-form";
import ContractDurationForm from "@/components/contract-duration/contract-duration-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

const BillingPlanCreatePage = async () => {

  const route = "/admin/contract-duration";
  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Contract Duration</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/contract-duration">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ContractDurationForm update={false} />
      </CardContent>
    </Card>
  );
};

export default BillingPlanCreatePage;
