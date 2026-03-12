import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import POForm from "@/components/purchase-order/purchase-order-form";
import Link from "next/link";
import { getBillingPlans } from "@/lib/actions/billing-plan";
import { getContractTypes } from "@/lib/actions/contract-type";
import { getServiceTypes } from "@/lib/actions/service-type";
import { getCustomers } from "@/lib/actions/customer";
import { Customer } from "@/types";

const POCreatePage = async () => {
  const billingPlan = await getBillingPlans()
  const contractType = await getContractTypes()
  const serviceType = await getServiceTypes()
  const customers = await getCustomers()
  

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Purchase Order</CardTitle>
          <Link href="/admin/purchase-orders">
            <Button className="bg-blue-500 hover:bg-blue-600">Back</Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <POForm update={false} billingPlan={billingPlan} contractType={contractType} serviceType={serviceType} customers={customers as Customer[]} />
      </CardContent>
    </Card>
  );
};

export default POCreatePage;