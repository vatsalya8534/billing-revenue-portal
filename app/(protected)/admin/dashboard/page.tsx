import { getProjects } from "@/lib/actions/project";
import { getCompanys } from "@/lib/actions/company";
import { PLDashboardComponent } from "@/components/pl/pl-dashboard-component";

export default async function DashboardPage() {

  const projects = await getProjects();
  const companies = await getCompanys();

  return (
    <div>
      <PLDashboardComponent companies={JSON.parse(JSON.stringify(companies))} projects={JSON.parse(JSON.stringify(projects))} />
    </div>
  )
}