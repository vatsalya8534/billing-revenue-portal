import { getDashboardStats } from "@/lib/actions/dashboard";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default async function DashboardPage() {

  const stats = await getDashboardStats();

  return <DashboardTabs stats={stats} />;
}