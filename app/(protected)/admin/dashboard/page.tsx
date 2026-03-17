import { getDashboardStats } from "@/lib/actions/dashboard";
import { BillingStatusChart } from "@/components/dashboard/billing-status-chart";
import { MonthlyBillingChart } from "@/components/dashboard/monthly-billing-chart";

export default async function DashboardPage() {

  const stats = await getDashboardStats();

  return (
    <div className="grid gap-6">

      {/* Top Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">Bill Count</p>
          <h2 className="text-2xl font-bold">{stats.billCount || 0}</h2>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Billing This Month ({stats.currentMonth})
          </p>
          <h2 className="text-2xl font-bold">₹{stats.billingThisMonth || 0}</h2>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Billed Amount</p>
          <h2 className="text-2xl font-bold">₹{stats.totalBilledAmount || 0}</h2>
        </div>
      </div>

      {/* Monthly Billing Trend Chart */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Monthly Billing Trend</h3>
        <MonthlyBillingChart />
      </div>

      {/* Billing Status Chart */}
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Billing Status</h3>
        <BillingStatusChart />
      </div>

    </div>
  );
}