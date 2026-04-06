import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import POForm from "@/components/purchase-order/purchase-order-form";
import Link from "next/link";
import { getPurchaseOrderById } from "@/lib/actions/purschase-order";
import { getBillingPlans } from "@/lib/actions/billing-plan";
import { getContractTypes } from "@/lib/actions/contract-type";
import { getServiceTypes } from "@/lib/actions/service-type";
import { getCustomers } from "@/lib/actions/customer";
import { BillingPlan, Company, Customer } from "@/types";
import { getContractDurations } from "@/lib/actions/contract-duration";
import { getCompanys } from "@/lib/actions/company";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

interface EditPOPageProps {
  params: Promise<{ id: string }>; // params is now a Promise
}

const EditPOPage = async ({ params }: EditPOPageProps) => {
  const billingPlan = await getBillingPlans()
  const contractType = await getContractTypes()
  const serviceType = await getServiceTypes()
  const customers = await getCustomers()
  const contractDurations = await getContractDurations()
  const companies = await getCompanys()

  const { id } = await params;

  const po = await getPurchaseOrderById(id);

  const route = "/admin/module";
  const canView = await canAccess(route, "edit")
  if (!canView) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Edit Revenue</CardTitle>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Link href="/admin/revenue">Back</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <POForm
          data={JSON.parse(JSON.stringify(po.data))}
          update={true}
          companies={companies as Company[]}
          billingPlan={billingPlan as BillingPlan[]}
          contractType={contractType}
          serviceType={serviceType}
          customers={customers as Customer[]}
          contractDurations={contractDurations} />
      </CardContent>
    </Card>
  );
};

export default EditPOPage;