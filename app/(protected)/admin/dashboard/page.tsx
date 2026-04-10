import { getProjects } from "@/lib/actions/project";
import { getCompanys } from "@/lib/actions/company";
import { PLDashboardComponent } from "@/components/pl/pl-dashboard-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PurchaseOrderDashboard from "@/components/purchase-order/purchase-order-dashboard";
import { getDashboardStats } from "@/lib/actions/dashboard";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const projects = await getProjects();
  const companies = await getCompanys();
  const stats = await getDashboardStats();

  const currentTab =
    searchParams?.tab === "revenue" ? "revenue" : "pl";

  return (
    <div>
    
      <Tabs defaultValue={currentTab}>
        <TabsList variant="line"> 
          <Link href="/admin/dashboard?tab=pl">
            <TabsTrigger value="pl" className="cursor-pointer">
              P&L
            </TabsTrigger>
          </Link>

          <Link href="/admin/dashboard?tab=revenue">
            <TabsTrigger value="revenue" className="cursor-pointer">
              Revenue
            </TabsTrigger>
          </Link>

        </TabsList>

        <TabsContent value="pl">
          <PLDashboardComponent
            companies={JSON.parse(JSON.stringify(companies))}
            projects={JSON.parse(JSON.stringify(projects))}
          />
        </TabsContent>

        <TabsContent value="revenue">
          <PurchaseOrderDashboard
            companies={JSON.parse(JSON.stringify(companies))}
            stats={stats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}