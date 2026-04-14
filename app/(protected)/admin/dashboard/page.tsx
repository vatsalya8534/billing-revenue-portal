import { getProjects } from "@/lib/actions/project";
import { getCompanys } from "@/lib/actions/company";
import { PLDashboardComponent } from "@/components/pl/pl-dashboard-component";
import PurchaseOrderDashboard from "@/components/purchase-order/purchase-order-dashboard";
import { getDashboardStats } from "@/lib/actions/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }> | { tab?: string };
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const projects = await getProjects();
  const companies = await getCompanys();
  const stats = await getDashboardStats();

  const currentTab =
    resolvedSearchParams?.tab === "revenue" ? "revenue" : "pl";

  if (currentTab === "revenue") {
    return (
      <PurchaseOrderDashboard
        companies={JSON.parse(JSON.stringify(companies))}
        stats={stats}
      />
    );
  }

  return (
    <PLDashboardComponent
      companies={JSON.parse(JSON.stringify(companies))}
      projects={JSON.parse(JSON.stringify(projects))}
    />
  );
}
