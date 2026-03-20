import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import POForm from "@/components/purchase-order/purchase-order-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBillingCyclesByPOID, getPurchaseOrderById } from "@/lib/actions/purschase-order";
import { getBillingPlanById, getBillingPlans } from "@/lib/actions/billing-plan";
import { getContractTypes } from "@/lib/actions/contract-type";
import { getServiceTypes } from "@/lib/actions/service-type";
import { getCustomers } from "@/lib/actions/customer";
import { BillingCycle, Customer } from "@/types";
import { getContractDurations } from "@/lib/actions/contract-duration";

interface EditPOPageProps {
  params: Promise<{ id: string }>; // params is now a Promise
}

const EditPOPage = async ({ params }: EditPOPageProps) => {
  const billingPlan = await getBillingPlans()
  const contractType = await getContractTypes()
  const serviceType = await getServiceTypes()
  const customers = await getCustomers()
  const contractDurations = await getContractDurations()

  const { id } = await params;

  const po = await getPurchaseOrderById(id);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Edit Revenue</CardTitle>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Link href="/admin/purchase-orders">Back</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <POForm
          data={po.data}
          update={true}
          billingPlan={billingPlan}
          contractType={contractType}
          serviceType={serviceType}
          customers={customers as Customer[]}
          contractDurations={contractDurations} />
      </CardContent>
    </Card>
  );
};

export default EditPOPage;