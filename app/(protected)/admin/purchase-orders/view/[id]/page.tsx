import { getPurchaseOrderById } from "@/lib/actions/purschase-order";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderViewPage({ params }: Props) {

  const { id } = await params;

  const res = await getPurchaseOrderById(id);

  if (!res.success || !res.data) {
    return (
      <p className="p-6 text-red-600 font-semibold">
        Purchase Order not found.
      </p>
    );
  }

  const po = res.data;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Revenue Details</CardTitle>

          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/purchase-orders">Back</Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ================= BASIC ================= */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold mb-2">Basic Details</h2>

              <p><strong>PO Number:</strong> {po.customerPONumber}</p>
              <p><strong>Status:</strong> {po.status}</p>
              <p><strong>Amount:</strong> ₹{po.poAmount}</p>
              <p><strong>Owner:</strong> {po.poOwner || "-"}</p>
              <p><strong>Payment Terms:</strong> {po.paymentTerms || "-"}</p>
              <p><strong>Remark:</strong> {po.remark || "-"}</p>

              <p>
                <strong>Start Date:</strong>{" "}
                {po.startFrom
                  ? format(new Date(po.startFrom), "dd/MM/yyyy")
                  : "-"}
              </p>

              <p>
                <strong>End Date:</strong>{" "}
                {po.endDate ? format(new Date(po.endDate), "dd/MM/yyyy") : "-"}
              </p>

              <p>
                <strong>Contract Days:</strong> {po.ageingDays ?? "-"}
              </p>

              <p><strong>Scope:</strong> {po.scope || "-"}</p>

            </div>

            {/* ================= RELATIONS ================= */}
            <div>
              <h2 className="font-semibold mb-2">Relations</h2>

              <p><strong>Service Type:</strong> {po.ServiceType?.name || "-"}</p>
              <p><strong>Billing Plan:</strong> {po.billingPlan?.name || "-"}</p>

              <p>
                <strong>Contract Duration:</strong>{" "}
                {po.contractDuration?.totalNumberOfMonths || "-"} months
              </p>

              <p><strong>Contract:</strong> {po.contract?.name || "-"}</p>
            </div>
          </section>

          {/* ================= CUSTOMER ================= */}
          <section>
            <h2 className="font-semibold mb-2">Customer</h2>

            <p>
              <strong>Company:</strong>{" "}
              {po.customer?.companyName || "-"}
            </p>

            <p>
              <strong>Name:</strong>{" "}
              {po.customer
                ? `${po.customer.firstName} ${po.customer.lastName}`
                : "-"}
            </p>

            <p><strong>Email:</strong> {po.customer?.email || "-"}</p>
            <p><strong>Phone:</strong> {po.customer?.phone || "-"}</p>
          </section>

          {/* ================= BILLING CYCLES ================= */}
          <section>
            <h2 className="font-semibold mb-2">Billing</h2>

            {po.billingCycles?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {po.billingCycles.map((bc: any, i: number) => (
                  <Card key={bc.id}>
                    <CardContent className="p-4 space-y-1">
                      <h3 className="font-medium">Cycle {i + 1}</h3>

                      <p><strong>Invoice No:</strong> {bc.invoiceNumber}</p>
                      <p><strong>Amount:</strong> ₹{bc.invoiceAmount}</p>
                      <p><strong>Collected:</strong> ₹{bc.collectedAmount ?? 0}</p>
                      <p><strong>TDS:</strong> {bc.tds || "-"}</p>

                      <p>
                        <strong>Invoice Date:</strong>{" "}
                        {bc.invoiceDate ? format(new Date(bc.invoiceDate), "dd/MM/yyyy") : "-"}
                      </p>

                      <p>
                        <strong>Submitted:</strong>{" "}
                        {bc.billingSubmittedDate
                          ? format(new Date(bc.billingSubmittedDate), "dd/MM/yyyy")
                          : "-"}
                      </p>

                      <p>
                        <strong>Due Date:</strong>{" "}
                        {bc.paymentDueDate
                          ? format(new Date(bc.paymentDueDate), "dd/MM/yyyy")
                          : "-"}
                      </p>

                      <p><strong>Payment Status:</strong> {bc.paymentReceived}</p>

                      <p>
                        <strong>Payment Date:</strong>{" "}
                        {bc.paymentReceivedDate
                          ? format(new Date(bc.paymentReceivedDate), "dd/MM/yyyy")
                          : "-"}
                      </p>

                      <p><strong>Remark:</strong> {bc.billingRemark || "-"}</p>
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