import { getPurchaseOrderById } from "@/lib/actions/purschase-order";
import { getBillingPlanById } from "@/lib/actions/billing-plan";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  params: { id: string | string[] };
}

export default async function PurchaseOrderViewPage({ params }: Props) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const res = await getPurchaseOrderById(id);

  if (!res.success || !res.data) {
    return <p className="p-6 text-red-600">Purchase Order not found.</p>;
  }

  const po = res.data;

  const billingCyclesWithPlan = await Promise.all(
    (po.billingCycles || []).map(async (bc: any) => {
      if (bc.billingPlanId) {
        const planRes = await getBillingPlanById(bc.billingPlanId);
        return {
          ...bc,
          billingPlan: planRes.success ? planRes.data : null,
        };
      }
      return bc;
    })
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Purchase Order Details</CardTitle>
          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/purchase-orders">Back</Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Details + Service Type */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold mb-2">Basic Details</h2>
              <p><strong>PO Number:</strong> {po.customerPONumber}</p>
              <p><strong>Status:</strong> {po.status}</p>
              <p><strong>Amount:</strong> ₹{po.poAmount}</p>
              <p><strong>Owner:</strong> {po.poOwner}</p>
              <p><strong>Payment Terms:</strong> {po.paymentTerms || "-"}</p>
              <p><strong>Remark:</strong> {po.remark || "-"}</p>
              <p><strong>Start Date:</strong> {po.startFrom ? format(new Date(po.startFrom), "dd/MM/yyyy") : "-"}</p>
              <p><strong>End Date:</strong> {po.endDate ? format(new Date(po.endDate), "dd/MM/yyyy") : "-"}</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Service Type</h2>
              <p><strong>Service Type:</strong> {po.ServiceType?.name || "-"}</p>
              <p><strong>Billing Plan:</strong> {po.billingPlan?.name || "-"}</p>
              <p><strong>Contract Duration:</strong> {po.contractDuration?.totalNumberOfMonths || "-"} months</p>
              <p><strong>Contract:</strong> {po.contract?.name || "-"}</p>
            </div>
          </section>

          {/* Customer Details */}
          <section>
            <h2 className="font-semibold mb-2">Customer Details</h2>
            <p><strong>Name:</strong> {po.customer?.firstName} {po.customer?.lastName}</p>
            <p><strong>Email:</strong> {po.customer?.email || "-"}</p>
            <p><strong>Phone:</strong> {po.customer?.phone || "-"}</p>
          </section>

          {/* Billing Cycles side by side */}
          <section>
            <h2 className="font-semibold mb-2">Billing Cycles</h2>
            {billingCyclesWithPlan.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {billingCyclesWithPlan.map((bc: any, idx: number) => (
                  <Card key={bc.id} className="border">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Cycle {idx + 1}</h3>
                      <p><strong>Billing Number:</strong> {bc.billingNumber}</p>
                      <p><strong>Amount:</strong> ₹{bc.billingAmount}</p>
                      <p><strong>Billing Date:</strong> {bc.billingDate ? format(new Date(bc.billingDate), "dd/MM/yyyy") : "-"}</p>
                      <p><strong>Submitted Date:</strong> {bc.billingSubmittedDate ? format(new Date(bc.billingSubmittedDate), "dd/MM/yyyy") : "-"}</p>
                      <p><strong>Payment Status:</strong> {bc.paymentReceived || "NO"}</p>
                      <p><strong>Payment Amount:</strong> ₹{bc.paymentReceivedAmount || 0}</p>
                      <p><strong>Payment Date:</strong> {bc.paymentReceivedDate ? format(new Date(bc.paymentReceivedDate), "dd/MM/yyyy") : "-"}</p>
                      <p><strong>Remark:</strong> {bc.billingRemark || "-"}</p>
                      {bc.billingPlan && <p><strong>Billing Plan:</strong> {bc.billingPlan.name}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p>No billing cycles found.</p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}