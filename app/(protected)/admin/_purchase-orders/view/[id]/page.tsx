import { getPurchaseOrderById } from "@/lib/actions/purschase-order";
import { format } from "date-fns";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import moment from "moment";

interface Props {
  params: Promise<{ id: string }>;
}

/* 🔹 Status Badge */
const StatusBadge = ({ value }: { value?: string }) => {
  return (
    <span className="text-xs font-medium border border-gray-300 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
      {value || "-"}
    </span>
  );
};

/* 🔹 Detail Row */
const Detail = ({
  label,
  value,
}: {
  label: string;
  value?: any;
}) => {
  return (
    <div className="flex justify-between items-center py-2 text-sm md:text-base border-b border-gray-100 last:border-none">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-gray-900 text-right">{value || "-"}</span>
    </div>
  );
};

/* 🔹 Reusable Card */
const Card = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      {title && (
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

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

  const totalCollected =
    po.billingCycles?.reduce(
      (sum: number, b: any) => sum + (b.collectedAmount || 0),
      0
    ) || 0;

  const pending = po.poAmount - totalCollected;

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Revenue Details
        </h1>

        <Button asChild variant="outline">
          <Link href="/admin/purchase-orders">Back</Link>
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">
            ₹{po.poAmount}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">
            ₹{totalCollected}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">
            ₹{pending}
          </p>
        </Card>
      </div>

      {/* BASIC + RELATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Basic Details">
          <Detail label="PO Number" value={po.customerPONumber} />
          <Detail label="Status" value={<StatusBadge value={po.status} />} />
          <Detail label="Owner" value={po.poOwner} />
          <Detail label="Payment Terms" value={po.paymentTerms} />
          <Detail label="Remark" value={po.remark} />

          <Detail
            label="Start Date"
            value={
              po.startFrom
                ? format(new Date(po.startFrom), "dd/MM/yyyy")
                : "-"
            }
          />

          <Detail
            label="End Date"
            value={
              po.endDate
                ? format(new Date(po.endDate), "dd/MM/yyyy")
                : "-"
            }
          />
        </Card>

        <Card title="Relations">
          <Detail label="Service Type" value={po.ServiceType?.name} />
          <Detail label="Billing Plan" value={po.billingPlan?.name} />
          <Detail
            label="Duration"
            value={`${po.contractDuration?.totalNumberOfMonths || "-"
              } months`}
          />
          <Detail label="Contract" value={po.contract?.name} />
        </Card>
      </div>

      {/* CUSTOMER */}
      <Card title="Customer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          <Detail label="Company" value={po.customer?.companyName} />

          <Detail
            label="Name"
            value={
              po.customer
                ? `${po.customer.firstName} ${po.customer.lastName}`
                : "-"
            }
          />

          <Detail label="Email" value={po.customer?.email} />
          <Detail label="Phone" value={po.customer?.phone} />
        </div>
      </Card>

      {/* BILLING TABLE */}
      <Card title="Billing Cycles">
        {po.billingCycles?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">

              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-4">#</th>
                  <th className="text-left p-4">Month</th>
                  <th className="text-left p-4">Invoice</th>
                  <th className="text-right p-4">Amount</th>
                  <th className="text-right p-4">Collected</th>
                  <th className="text-left p-4">Invoice Date</th>
                  <th className="text-left p-4">Due Date</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {po.billingCycles.map((bc: any, i: number) => (
                  <tr
                    key={bc.id}
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="p-4">{i + 1}</td>
                    <td className="p-4">{moment(bc.invoiceDate).format("MMMM")} {moment(bc.invoiceDate).format("YYYY")}</td>
                    <td className="p-4">{bc.invoiceNumber}</td>
                    <td className="p-4 text-right">
                      ₹{bc.invoiceAmount}
                    </td>
                    <td className="p-4 text-right">
                      ₹{bc.collectedAmount ?? 0}
                    </td>
                    <td className="p-4">
                      {bc.invoiceDate
                        ? format(
                          new Date(bc.invoiceDate),
                          "dd/MM/yyyy"
                        )
                        : "-"}
                    </td>
                    <td className="p-4">
                      {bc.paymentDueDate
                        ? format(
                          new Date(bc.paymentDueDate),
                          "dd/MM/yyyy"
                        )
                        : "-"
                      }
                    </td>
                    <td className="p-4">
                      <StatusBadge value={bc.paymentReceived} />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No billing cycles found.
          </p>
        )}
      </Card>
    </div>
  );
}