import { getProjects } from "@/lib/actions/project";
import { getCompanys } from "@/lib/actions/company";
import { PLDashboardComponent } from "@/components/pl/pl-dashboard-component";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PurchaseOrderDashboard from "@/components/purchase-order/purchase-order-dashboard";
import { getDashboardStats } from "@/lib/actions/dashboard";

export default async function DashboardPage() {

  const projects = await getProjects();
  const companies = await getCompanys();
  const stats = await getDashboardStats();

  return (
    <div>
      <Tabs defaultValue="pl">
        <TabsList variant="line">
          <TabsTrigger value="pl" className="cursor-pointer">PL</TabsTrigger>
          <TabsTrigger value="revenue" className="cursor-pointer">Revenue</TabsTrigger>
        </TabsList>
        <TabsContent value="pl">
          <PLDashboardComponent companies={JSON.parse(JSON.stringify(companies))} projects={JSON.parse(JSON.stringify(projects))} />
        </TabsContent>
        <TabsContent value="revenue">
          <PurchaseOrderDashboard companies={JSON.parse(JSON.stringify(companies))} stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}