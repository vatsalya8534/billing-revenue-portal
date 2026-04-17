"use server";

import { fetchPLPageData } from "@/lib/actions/project";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import moment from "moment";
import { CardContent } from "@/components/ui/card";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

const safeNumber = (value: any) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const StatusBadge = ({ value }: { value?: string }) => (
  <span className="text-xs font-medium border border-gray-300 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
    {value || "-"}
  </span>
);

const Detail = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex justify-between items-center py-2 text-sm md:text-base border-b border-gray-100 last:border-none">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-900 text-right">{value ?? "-"}</span>
  </div>
);

const Card = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
    {title && (
      <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
    )}
    {children}
  </div>
);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PLViewPage({ params }: Props) {
  const { id } = await params;

  const route = "/admin/pl";
  const canView = await canAccess(route, "view");
  if (!canView) redirect("/404");

  const data = await fetchPLPageData(id);

  if (!data.success || !data.project) {
    return <p className="p-6 text-red-600 font-semibold">Project not found.</p>;
  }

  const { project } = data;
  const billingCycles: any[] = data.billingCycles ?? [];

  const totalValues = {
    totalPOValue: safeNumber(project.poValue),
    totalBilledValue: safeNumber(project.totalRevenue),
    totalCostValue: safeNumber(project.totalCost),
    totalResourceCount: safeNumber(project.resourceCount),
    totalFMSValue: billingCycles.reduce((sum, b) => sum + safeNumber(b.fms), 0),
    totalSpareValue: billingCycles.reduce(
      (sum, b) => sum + safeNumber(b.spare),
      0,
    ),
    totalMiscCostValue: billingCycles.reduce(
      (sum, b) => sum + safeNumber(b.otherCost),
      0,
    ),

    totalProjectedProfit: safeNumber(project.projectedProfit),

    totalProfit:
      safeNumber(project.totalRevenue) === 0
        ? 0
        : Math.round(
            ((safeNumber(project.totalRevenue) -
              safeNumber(project.totalCost)) /
              safeNumber(project.totalRevenue)) *
              100,
          ),
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Project Profit & Loss Details
        </h1>
        <Button asChild variant="outline">
          <Link href="/admin/pl">Back</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[
          ["Total PO Value", totalValues.totalPOValue, true],
          ["Total Billed Value", totalValues.totalBilledValue, true],
          ["Total Cost Value", totalValues.totalCostValue, true],
          ["Agreed Resource Count", totalValues.totalResourceCount, false],
          ["Total FMS Value", totalValues.totalFMSValue, true],
          ["Total Spare Value", totalValues.totalSpareValue, true],
          ["Miscellaneous Cost", totalValues.totalMiscCostValue, true],
          ["Projected Profit %", `${totalValues.totalProjectedProfit}%`, false],
        ].map(([label, value, money]) => (
          <Card key={String(label)}>
            <CardContent>
              <div className="flex justify-between">
                <span className="font-bold">{label}</span>
                <span className="text-blue-500 font-bold">
                  {money ? `₹${Number(value).toLocaleString()}` : value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Total GM %</span>
              <span className="text-blue-500 font-bold">
                {totalValues.totalProfit}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Project Details">
          <Detail label="Project Name" value={project.projectName} />
          <Detail
            label="Status"
            value={<StatusBadge value={project.status} />}
          />
          <Detail
            label="Start Date"
            value={
              project.startDate
                ? format(new Date(project.startDate), "dd/MM/yyyy")
                : "-"
            }
          />
          <Detail
            label="End Date"
            value={
              project.endDate
                ? format(new Date(project.endDate), "dd/MM/yyyy")
                : "-"
            }
          />
          <Detail
            label="PO Value"
            value={`₹${safeNumber(project.poValue).toLocaleString()}`}
          />
          <Detail
            label="Resource Count"
            value={safeNumber(project.resourceCount)}
          />
          <Detail label="Order Type" value={project.orderType} />
        </Card>

        <Card title="Company Details">
          <Detail label="Company Name" value={project.company?.name} />
          <Detail label="Email" value={project.company?.email} />
          <Detail label="Phone" value={project.company?.phone} />
        </Card>
      </div>

      <Card title="Billing Cycles">
        {billingCycles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="text-left p-4">#</th>
                  <th className="text-left p-4">Month</th>
                  <th className="text-right p-4">Billable Amount</th>
                  <th className="text-right p-4">Billed Amount</th>
                  <th className="text-right p-4">Resource Used</th>
                  <th className="text-right p-4">FMS</th>
                  <th className="text-right p-4">Spare</th>
                  <th className="text-right p-4">Other Cost</th>
                  <th className="text-right p-4">Total Cost</th>
                  <th className="text-right p-4">Profit (₹)</th>
                  <th className="text-right p-4">GM%</th>
                </tr>
              </thead>
              <tbody>
                {billingCycles.map((bc, i) => {
                  const totalCost =
                    safeNumber(bc.fms) +
                    safeNumber(bc.spare) +
                    safeNumber(bc.otherCost);
                  const profitAmount = safeNumber(bc.billedAmount) - totalCost;
                  const profitPercent =
                    safeNumber(bc.billedAmount) === 0
                      ? 0
                      : (
                          (profitAmount / safeNumber(bc.billedAmount)) *
                          100
                        ).toFixed(2);

                  return (
                    <tr
                      key={bc.id ?? i}
                      className={
                        Number(profitPercent) >=
                        safeNumber(project.projectedProfit)
                          ? "border-b last:border-none bg-green-50 hover:bg-green-100 transition"
                          : "border-b last:border-none bg-red-50 hover:bg-red-100 transition"
                      }
                    >
                      <td className="p-4">{i + 1}</td>

                      <td className="p-4">
                        {moment().month(Number(bc.month)).format("MMMM")}{" "}
                        {bc.year}
                      </td>

                      <td className="p-4 text-right">
                        ₹{safeNumber(bc.billableAmount).toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        ₹{safeNumber(bc.billedAmount).toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        {safeNumber(bc.resourceUsed)}
                      </td>

                      <td className="p-4 text-right">
                        ₹{safeNumber(bc.fms).toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        ₹{safeNumber(bc.spare).toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        ₹{safeNumber(bc.otherCost).toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        ₹{totalCost.toLocaleString()}
                      </td>

                      <td className="p-4 text-right">
                        ₹{profitAmount.toLocaleString()}
                      </td>

                      <td className="p-4 text-right">{profitPercent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No billing cycles found.</p>
        )}
      </Card>
    </div>
  );
}
