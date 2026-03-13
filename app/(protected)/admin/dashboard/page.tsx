import { BillingPaymentChart } from "@/components/dashboard/billing-payment-chart";
import { BillingStatusChart } from "@/components/dashboard/billing-status-chart";
import { MonthlyBillingChart } from "@/components/dashboard/monthly-billing-chart";

export default function DashboardPage() {
  return (
    <div className="grid gap-6">

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <p>Billing Till Date</p>
          <h2 className="text-2xl font-bold">₹2,50,000</h2>
        </div>

        <div className="p-4 border rounded-lg">
          <p>Billing This Month</p>
          <h2 className="text-2xl font-bold">₹45,000</h2>
        </div>

        <div className="p-4 border rounded-lg">
          <p>Bill Count</p>
          <h2 className="text-2xl font-bold">35</h2>
        </div>

        <div className="p-4 border rounded-lg">
          <p>Total Billed Amount</p>
          <h2 className="text-2xl font-bold">₹8,90,000</h2>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Monthly Billing Trend
        </h3>
        <MonthlyBillingChart />
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Billing vs Payment
        </h3>
        <BillingPaymentChart />
      </div>

      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Billing Status
        </h3>
        <BillingStatusChart />
      </div>
    </div>
  )
}